import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { message } from 'antd';
import { ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow';
import DeploymentFlow from '../../components/editors/DeploymentFlow';
import DeploymentSidebar from '../../components/editors/DeploymentSidebar';

const DynamicComponentWithNoSSR = dynamic(() => import('../../components/layouts/Main'), {
  ssr: false,
});

const i18nContent: any = {
  "en-US": {
  },
  "ja-JP": {
  },
};

interface FlowDataType {
  key: string;
  flowId: string;
  deploymentManifest: string;
}

interface ModuleDataType {
  key: React.Key;
  moduleId: string;
  moduleName: string;
  moduleVersion: string;
  osPlatform: string[];
  nodeType: string;
  containerId: string;
  imageUri: string;
  iconUri: string;
  restartPolicy: string;
  desiredStatus: string;
  imagePullPolicy: string;
  startupOrder: string;
  environmentVariables: string;
  containerCreateOptions: string;
  moduleTwinSettings: string;
}

const initialNodes: any = [];

const initialEdges: any = [];

export default function AddEdgeFlowPage(props: any) {
  const router = useRouter();
  const { locale } = props.context;
  const _: any = i18nContent[locale];
  const [messageApi, contextHolder] = message.useMessage();
  const [moduleList, setModuleList] = useState<ModuleDataType[]>([]);
  const [flowList, setFlowList] = useState<FlowDataType[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const getModuleList = async () => {
    messageApi.open({
      key: 'getmodulelist',
      type: 'loading',
      content: 'Loading...',
    });
    let response = await fetch('/api/module?' + new URLSearchParams());
    let jsonResponse: any = await response.json();
    setModuleList(jsonResponse);
    messageApi.open({
      key: 'getmodulelist',
      type: 'success',
      content: 'Loaded!',
      duration: 1,
    });
  };

  useEffect(() => {
    let unmounted = false;
    if (!unmounted) {
      getModuleList();
    }
    return () => {
      unmounted = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {contextHolder}
      <DynamicComponentWithNoSSR locale={locale} pathname={router.pathname}>
        <section className="max-w-full w-full h-full flex pl-0 pr-0 pt-0 pb-0">
          <ReactFlowProvider>
            <DeploymentSidebar flowList={flowList} setFlowList={setFlowList} moduleList={moduleList} nodes={nodes} setNodes={setNodes} edges={edges} />
            <DeploymentFlow nodes={nodes} setNodes={setNodes} onNodesChange={onNodesChange} edges={edges} setEdges={setEdges} onEdgesChange={onEdgesChange} />
          </ReactFlowProvider>
        </section>
      </DynamicComponentWithNoSSR>
    </>
  );
}

export async function getStaticProps(context: any) {
  return {
    props: {
      context,
    },
  };
}
