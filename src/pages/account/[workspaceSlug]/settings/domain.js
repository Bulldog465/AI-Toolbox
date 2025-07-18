import { useState } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import isFQDN from 'validator/lib/isFQDN';

import Button from '@/components/Button/index';
import DomainCard from '@/components/Card/domain';
import Card from '@/components/Card/index';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import { useDomains } from '@/hooks/data';
import { AccountLayout } from '@/layouts/index';
import api from '@/lib/common/api';
import { getWorkspace, isWorkspaceOwner } from '@/prisma/services/workspace';
import { useTranslation } from "react-i18next";

const Domain = ({ isTeamOwner, workspace }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useDomains(workspace.slug);
  const [domain, setDomain] = useState('');
  const [isSubmitting, setSubmittingState] = useState(false);
  const validDomainName = isFQDN(domain);

  const addDomain = (event) => {
    event.preventDefault();
    setSubmittingState(true);
    api(`/api/workspace/${workspace.slug}/domain`, {
      body: { domainName: domain },
      method: 'POST',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        setDomain('');
        toast.success('Domain successfully added to workspace!');
      }
    });
  };

  const handleDomainChange = (event) => setDomain(event.target.value);

  const refresh = (domain, verified) => {
    setSubmittingState(true);

    if (verified) {
      mutate(`/api/workspace/domain/check?domain=${domain}`).then(() =>
        setSubmittingState(false)
      );
    } else {
      api(`/api/workspace/${workspace.slug}/domain`, {
        body: { domainName: domain },
        method: 'PUT',
      }).then((response) => {
        setSubmittingState(false);

        if (response.errors) {
          Object.keys(response.errors).forEach((error) =>
            toast.error(response.errors[error].msg)
          );
        } else {
          toast.success('Domain successfully verified!');
        }
      });
    }

    return verified;
  };

  const remove = (domain) => {
    api(`/api/workspace/${workspace.slug}/domain`, {
      body: { domainName: domain },
      method: 'DELETE',
    }).then((response) => {
      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toast.success('Domain successfully deleted from workspace!');
      }
    });
  };

  return (
    <AccountLayout>
      <Meta title={`AI Toolbox™ - ${workspace.name} | Domains`} />
      <Content.Title
        title={t("settings.domain.subdomain.management")}
        subtitle={t("settings.domain.subdomain.management.description")}
      />
      <Content.Divider />
      <Content.Container>
        <Card>
          <Card.Body
            title={t("settings.domain.subdomain.title")}
            subtitle={t("settings.domain.subdomain.description")}
          >
            <div className="flex items-center justify-between px-3 py-2 font-mono text-sm border rounded md:w-1/2">
              <div>
                <strong>{workspace.slug}</strong>
                <span className="pr-3">.{workspace.host}</span>
              </div>
              <Link href={`http://${workspace.hostname}`} target="_blank">
                <ArrowTopRightOnSquareIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Content.Container>
      {isTeamOwner && (
        <>
          <Content.Divider thick />
          <Content.Title
            title={t("settings.domain.domain.configuration")}
            subtitle={t("settings.domain.domain.configuration.description")}
          />
          <Content.Divider />
          <Content.Container>
            <Card>
              <form>
                <Card.Body
                  title={t("settings.domain.add.label")}
                  subtitle={t("settings.domain.add.description")}
                >
                  <input
                    className="px-3 py-2 border rounded md:w-1/2"
                    disabled={isSubmitting}
                    onChange={handleDomainChange}
                    placeholder="mydomain.com"
                    type="text"
                    value={domain}
                  />
                </Card.Body>
                <Card.Footer>
                  <span />
                  <Button
                    className="text-white bg-blue-600 hover:bg-blue-500"
                    disabled={!validDomainName || isSubmitting}
                    onClick={addDomain}
                  >
                    Add
                  </Button>
                </Card.Footer>
              </form>
            </Card>
            {isLoading ? (
              <DomainCard isLoading />
            ) : data?.domains.length > 0 ? (
              data.domains.map((domain, index) => (
                <DomainCard
                  key={index}
                  apex={process.env.NEXT_PUBLIC_VERCEL_IP_ADDRESS}
                  cname={workspace.hostname}
                  isLoading={isSubmitting}
                  domain={domain}
                  refresh={refresh}
                  remove={remove}
                />
              ))
            ) : (
              <Content.Empty>
                {t("settings.domain.empty.message")}
              </Content.Empty>
            )}
          </Content.Container>
        </>
      )}
    </AccountLayout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  let isTeamOwner = false;
  let workspace = null;

  if (session) {
    workspace = await getWorkspace(
      session.user.userId,
      session.user.email,
      context.params.workspaceSlug
    );

    if (workspace) {
      const { host } = new URL(process.env.APP_URL);
      isTeamOwner = isWorkspaceOwner(session.user.email, workspace);
      workspace.host = host;
      workspace.hostname = `${workspace.slug}.${host}`;
    }
  }

  return {
    props: {
      isTeamOwner,
      workspace,
    },
  };
};

export default Domain;
