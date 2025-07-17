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
  const [isSubmitting, setSubmittingState] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [showModal, setModalState] = useState(false);
  const [userCode] = useState(user.userCode);
  const [verifyEmail, setVerifyEmail] = useState('');
  const validName = name.length > 0 && name.length <= 32;
  const validEmail = isEmail(email);
  const { t } = useTranslation();
  const verifiedEmail = verifyEmail === email;

  const copyToClipboard = () => toast.success('Copied to clipboard!');

  const changeName = async (event) => {
    event.preventDefault();
    setSubmittingState(true);
    const response = await api('/api/user/name', {
      body: { name },
      method: 'PUT',
    });
    setSubmittingState(false);

    if (response.errors) {
      Object.values(response.errors).forEach(error =>
        toast.error(error.msg)
      );
    } else {
      toast.success('Name successfully updated!');
    }
  };

  const changeEmail = async (event) => {
    event.preventDefault();
    if (confirm('Are you sure you want to update your email address?')) {
      setSubmittingState(true);
      const response = await api('/api/user/email', {
        body: { email },
        method: 'PUT',
      });
      setSubmittingState(false);

      if (response.errors) {
        Object.values(response.errors).forEach(error =>
          toast.error(error.msg)
        );
      } else {
        toast.success('Email successfully updated and signing you out!');
        setTimeout(() => signOut({ callbackUrl: '/auth/login' }), 2000);
      }
    }
  };

  const deactivateAccount = async (event) => {
    event.preventDefault();
    setSubmittingState(true);
    const response = await api('/api/user', { method: 'DELETE' });
    setSubmittingState(false);
    toggleModal();

    if (response.errors) {
      Object.values(response.errors).forEach(error =>
        toast.error(error.msg)
      );
    } else {
      toast.success('Account has been deactivated!');
    }
  };

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleNameChange = (e) => setName(e.target.value);
  const handleVerifyEmailChange = (e) => setVerifyEmail(e.target.value);
  const toggleModal = () => {
    setVerifyEmail('');
    setModalState(!showModal);
  };

  return (
    <AccountLayout>
      <Meta title="AI Toolbox™ - Account Settings" />
      <Content.Title
        title={t("settings.header.title")}
        subtitle={t("settings.header.description")}
      />
      <Content.Divider />
      <Content.Container>
        <Card>
          <form>
            <Card.Body
              title={t("settings.profile.name")}
              subtitle="Please enter your full name, or a display name you are comfortable with"
            >
              <input
                className="px-3 py-2 border rounded md:w-1/2"
                disabled={isSubmitting}
                onChange={handleNameChange}
                type="text"
                value={name}
              />
            </Card.Body>
            <Card.Footer>
              <small>{t("settings.profile.name.validation.message")}</small>
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
            <Card.Body
              title={t("settings.profile.email.label")}
              subtitle={t("settings.profile.email.description")}
            >
              <input
                className="px-3 py-2 border rounded md:w-1/2"
                disabled={isSubmitting}
                onChange={handleEmailChange}
                type="email"
                value={email}
              />
            </Card.Body>
            <Card.Footer>
              <small>{t("settings.profile.email.message")}</small>
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
          <Card.Body
            title={t("settings.profile.personal.account.id")}
            subtitle={t("settings.profile.personal.account.message")}
          >
            <div className="flex items-center justify-between px-3 py-2 space-x-5 font-mono text-sm border rounded md:w-1/2">
              <span className="overflow-x-auto">{userCode}</span>
              <CopyToClipboard onCopy={copyToClipboard} text={userCode}>
                <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
              </CopyToClipboard>
            </div>
          </Card.Body>
        </Card>

        <Card danger>
          <Card.Body
            title={t("settings.account.deactive.title")}
            subtitle={t("settings.account.deactive.description")}
          />
          <Card.Footer>
            <small>{t("settings.account.deactive.message")}</small>
            <Button
              className="text-white bg-red-600 hover:bg-red-500"
              onClick={toggleModal}
            >
              {t("settings.account.action.deactive.label")}
            </Button>
          </Card.Footer>

          <Modal
            show={showModal}
            title="Deactivate Personal Account"
            toggle={toggleModal}
          >
            <p>{t("settings.account.action.deactive.label")}</p>
            <p className="px-3 py-2 text-red-600 border border-red-600 rounded">
              <strong>Warning:</strong> {t("settings.account.deactive.message")}
            </p>
            <div className="flex flex-col">
              <label className="text-sm text-gray-400">
                Enter <strong>{user.email}</strong> to continue:
              </label>
              <input
                className="px-3 py-2 border rounded"
                disabled={isSubmitting}
                onChange={handleVerifyEmailChange}
                type="email"
                value={verifyEmail}
              />
            </div>
            <div className="flex flex-col items-stretch">
              <Button
                className="text-white bg-red-600 hover:bg-red-500"
                disabled={!verifiedEmail || isSubmitting}
                onClick={deactivateAccount}
              >
                <span>{t("settings.account.action.deactive.label")}</span>
              </Button>
            </div>
          </Modal>
        </Card>
      </Content.Container>
    </AccountLayout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  const { email, name, userCode } = await getUser(session.user?.userId);
  return {
    props: {
      user: { email, name, userCode },
    },
  };
};

export default Settings;
