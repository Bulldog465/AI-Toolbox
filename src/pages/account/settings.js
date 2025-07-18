import { useState } from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { getSession, signOut } from 'next-auth/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import isEmail from 'validator/lib/isEmail';

import Button from '@/components/Button/index';
import Card from '@/components/Card/index';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import Modal from '@/components/Modal/index';
import { AccountLayout } from '@/layouts/index';
import api from '@/lib/common/api';
import { getUser } from '@/prisma/services/user';
import { useTranslation } from "react-i18next";

const Settings = ({ user }) => {
  const [email, setEmail] = useState(user.email || '');
  const [name, setName] = useState(user.name || '');
  const [userCode] = useState(user.userCode);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [isSubmitting, setSubmittingState] = useState(false);
  const [showModal, setModalState] = useState(false);
  const { t } = useTranslation();

  const validName = name.length > 0 && name.length <= 32;
  const validEmail = isEmail(email);
  const verifiedEmail = verifyEmail === email;

  const copyToClipboard = () => toast.success('Copied to clipboard!');

  const changeName = async (e) => {
    e.preventDefault();
    setSubmittingState(true);
    const response = await api('/api/user/name', { body: { name }, method: 'PUT' });
    setSubmittingState(false);

    response.errors
      ? Object.values(response.errors).forEach(error => toast.error(error.msg))
      : toast.success('Name successfully updated!');
  };

  const changeEmail = async (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to update your email address?')) {
      setSubmittingState(true);
      const response = await api('/api/user/email', { body: { email }, method: 'PUT' });
      setSubmittingState(false);

      response.errors
        ? Object.values(response.errors).forEach(error => toast.error(error.msg))
        : (toast.success('Email successfully updated. Logging out...'), setTimeout(() => signOut({ callbackUrl: '/auth/login' }), 2000));
    }
  };

  const deactivateAccount = async (e) => {
    e.preventDefault();
    setSubmittingState(true);
    const response = await api('/api/user', { method: 'DELETE' });
    setSubmittingState(false);
    toggleModal();

    response.errors
      ? Object.values(response.errors).forEach(error => toast.error(error.msg))
      : toast.success('Account has been deactivated!');
  };

  const toggleModal = () => {
    setVerifyEmail('');
    setModalState(!showModal);
  };

  return (
    <AccountLayout>
      <Meta title="Account Settings | AI Toolbox™" />
      <Content.Title
        title={t("settings.header.title")}
        subtitle={t("settings.header.description")}
      />
      <Content.Divider />
      <Content.Container>

        <Card>
          <form>
            <Card.Body title={t("settings.profile.name")} subtitle="Enter your full name or display name.">
              <input
                className="px-3 py-2 border rounded md:w-1/2"
                disabled={isSubmitting}
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
              />
            </Card.Body>
            <Card.Footer>
              <Button
                className="text-white bg-blue-600 hover:bg-blue-500"
                disabled={!validName || isSubmitting}
                onClick={changeName}
              >
                {t("common.label.save")}
              </Button>
            </Card.Footer>
          </form>
        </Card>

        <Card>
          <form>
            <Card.Body title={t("settings.profile.email.label")} subtitle={t("settings.profile.email.description")}>
              <input
                className="px-3 py-2 border rounded md:w-1/2"
                disabled={isSubmitting}
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
              />
            </Card.Body>
            <Card.Footer>
              <Button
                className="text-white bg-blue-600 hover:bg-blue-500"
                disabled={!validEmail || isSubmitting}
                onClick={changeEmail}
              >
                {t("common.label.save")}
              </Button>
            </Card.Footer>
          </form>
        </Card>

        <Card>
          <Card.Body title={t("settings.profile.personal.account.id")} subtitle={t("settings.profile.personal.account.message")}>
            <div className="flex items-center justify-between px-3 py-2 font-mono text-sm border rounded md:w-1/2">
              <span>{userCode}</span>
              <CopyToClipboard text={userCode} onCopy={copyToClipboard}>
                <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
              </CopyToClipboard>
            </div>
          </Card.Body>
        </Card>

        <Card danger>
          <Card.Body title={t("settings.account.deactive.title")} subtitle={t("settings.account.deactive.description")} />
          <Card.Footer>
            <Button
              className="text-white bg-red-600 hover:bg-red-500"
              onClick={toggleModal}
            >
              {t("settings.account.action.deactive.label")}
            </Button>
          </Card.Footer>

          <Modal show={showModal} title="Deactivate Account" toggle={toggleModal}>
            <p>Type your email to confirm deactivation:</p>
            <input
              className="px-3 py-2 my-2 border rounded"
              disabled={isSubmitting}
              onChange={(e) => setVerifyEmail(e.target.value)}
              value={verifyEmail}
              type="email"
            />
            <Button
              className="text-white bg-red-600 hover:bg-red-500"
              disabled={!verifiedEmail || isSubmitting}
              onClick={deactivateAccount}
            >
              Confirm Deactivation
            </Button>
          </Modal>
        </Card>

      </Content.Container>
    </AccountLayout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session?.user?.id) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const userData = await getUser(session.user.id);

  if (!userData) {
    return { notFound: true };
  }

  const { email, name, userCode } = userData;

  return { props: { user: { email, name, userCode } } };
};

export default Settings;
