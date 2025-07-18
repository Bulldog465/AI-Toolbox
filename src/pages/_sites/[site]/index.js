import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import DefaultErrorPage from 'next/error';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Meta from '@/components/Meta';
import {
  getSiteWorkspace,
  getWorkspacePaths,
} from '@/prisma/services/workspace';

const Site = ({ workspace }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  const pageTitle = workspace
    ? `${workspace.name} | AI Toolbox™ Workspace`
    : 'Workspace | AI Toolbox™';

  return workspace ? (
    <main className="relative flex flex-col items-center justify-center min-h-screen space-y-10 text-gray-800 bg-gray-50">
      <Meta title={pageTitle} />
      <div className="flex flex-col items-center justify-center p-10 space-y-5 text-center">
        <h1 className="text-4xl font-bold">
          Welcome to your AI Toolbox™ workspace subdomain!
        </h1>
        <h2 className="text-2xl">
          This workspace belongs to <strong>{workspace.name}</strong>.
        </h2>
        <p>Quick links to access:</p>

        <Link
          href={`https://${workspace.hostname}`}
          className="flex space-x-3 text-blue-600 hover:underline"
          target="_blank"
        >
          <span>{workspace.hostname}</span>
          <ArrowTopRightOnSquareIcon className="w-5 h-5" />
        </Link>

        {workspace.domains.map((domain, index) => (
          <Link
            key={index}
            href={`https://${domain.name}`}
            className="flex space-x-3 text-blue-600 hover:underline"
            target="_blank"
          >
            <span>{domain.name}</span>
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
          </Link>
        ))}
      </div>
    </main>
  ) : (
    <>
      <Meta title="Workspace Not Found | AI Toolbox™" noIndex />
      <DefaultErrorPage statusCode={404} />
    </>
  );
};

export const getStaticPaths = async () => {
  const paths = await getWorkspacePaths();
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const { site } = params;
  const siteWorkspace = await getSiteWorkspace(site, site.includes('.'));
  let workspace = null;

  if (siteWorkspace) {
    const { host } = new URL(process.env.APP_URL);
    workspace = {
      domains: siteWorkspace.domains,
      name: siteWorkspace.name,
      hostname: `${siteWorkspace.slug}.${host}`,
    };
  }

  return {
    props: { workspace },
    revalidate: 10,
  };
};

export default Site;
