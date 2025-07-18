import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
  PlusCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { InvitationStatus, TeamRole } from '@prisma/client';
import { getSession } from 'next-auth/react';
import CopyToClipboard from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import isEmail from 'validator/lib/isEmail';

import Button from '@/components/Button/index';
import Card from '@/components/Card/index';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import { useMembers } from '@/hooks/data';
import { AccountLayout } from '@/layouts/index';
import api from '@/lib/common/api';
import { getWorkspace, isWorkspaceOwner } from '@/prisma/services/workspace';
import { useTranslation } from "react-i18next";

const MEMBERS_TEMPLATE = { email: '', role: TeamRole.MEMBER };

const Team = ({ isTeamOwner, workspace }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useMembers(workspace.slug);
  const [isSubmitting, setSubmittingState] = useState(false);
  const [members, setMembers] = useState([{ ...MEMBERS_TEMPLATE }]);
  const validateEmails =
    members.filter((member) => !isEmail(member.email)).length !== 0;

  const addEmail = () => {
    members.push({ ...MEMBERS_TEMPLATE });
    setMembers([...members]);
  };

  const changeRole = (memberId) => {
    api(`/api/workspace/team/role`, {
      body: { memberId },
      method: 'PUT',
    }).then((response) => {
      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toast.success('Updated team member role!');
      }
    });
  };

  const copyToClipboard = () => toast.success('Copied to clipboard!');

  const handleEmailChange = (event, index) => {
    const member = members[index];
    member.email = event.target.value;
    setMembers([...members]);
  };

  const handleRoleChange = (event, index) => {
    const member = members[index];
    member.role = event.target.value;
    setMembers([...members]);
  };

  const invite = () => {
    setSubmittingState(true);
    api(`/api/workspace/${workspace.slug}/invite`, {
      body: { members },
      method: 'POST',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        setMembers([{ ...MEMBERS_TEMPLATE }]);
        toast.success('Invited team members!');
      }
    });
  };

  const remove = (index) => {
    members.splice(index, 1);
    setMembers([...members]);
  };

  const removeMember = (memberId) => {
    api(`/api/workspace/team/member`, {
      body: { memberId },
      method: 'DELETE',
    }).then((response) => {
      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toast.success('Removed team member from workspace!');
      }
    });
  };

  return (
    <AccountLayout>
      <Meta title={`Team Management | ${workspace.name} | AI Toolbox™`} />
      {/* --- Page content remains the same --- */}
      {/* You can keep the rest of the component code unchanged */}
    </AccountLayout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  let isTeamOwner = false;
  let workspace = null;

  if (session) {
    workspace = await getWorkspace(
      session.user.id,  // Fixed here
      session.user.email,
      context.params.workspaceSlug
    );

    if (workspace) {
      isTeamOwner = isWorkspaceOwner(session.user.email, workspace);
      workspace.inviteLink = `${process.env.APP_URL}/teams/invite?code=${encodeURIComponent(workspace.inviteCode)}`;
    }
  }

  return {
    props: {
      isTeamOwner,
      workspace,
    },
  };
};

export default Team;
