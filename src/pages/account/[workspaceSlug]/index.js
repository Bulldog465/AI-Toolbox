import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import { AccountLayout } from '@/layouts/index';
import { useWorkspace } from '@/providers/workspace';

const Workspace = () => {
  const { workspace } = useWorkspace();

  return (
    workspace && (
      <AccountLayout>
        <Meta title={`Dashboard | ${workspace.name} | AI Toolbox™`} />
        <Content.Title
          title={workspace.name}
          subtitle="This is your project's workspace dashboard"
        />
        <Content.Divider />
        <Content.Container />
      </AccountLayout>
    )
  );
};

export default Workspace;
