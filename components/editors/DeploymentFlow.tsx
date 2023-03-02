import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background, addEdge } from 'reactflow';
import { Modal, Input } from 'antd';
import DefaultNode from './nodes/Default';
import InputNode from './nodes/Input';
import NoneNode from './nodes/None';
import OutputNode from './nodes/Output';

let node_id = 1;

let edge_id = 1;

const getNodeId = () => `node${node_id++}`;

const getEdgeId = () => `edge${edge_id++}`;

export default function DeploymentFlowComponent(props: any) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [edgeSource, setEdgeSource] = useState("*");
  const [edgeSink, setEdgeSink] = useState("input1");
  const [edgeCondition, setEdgeCondition] = useState("");
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [edgeConnection, setEdgeConnection] = useState<any>();

  const handleOk = () => {
    if (edgeConnection) {
      const sourceNode = props.nodes.find((node: any) => node.id === edgeConnection.source);
      const targetNode = props.nodes.find((node: any) => node.id === edgeConnection.target);
      let conditionNode = '';
      if (edgeCondition.length > 0) {
        conditionNode = ` WHERE ${edgeCondition}`;
      };
      const newEdge = {
        ...edgeConnection,
        id: getEdgeId(),
        animated: true,
        label: targetNode?.type === 'output'
          ? `FROM ${edgeSource}${conditionNode} INTO $upstream`
          : `FROM ${edgeSource}${conditionNode} INTO ${edgeSink}`,
        data: {
          route: targetNode?.type === 'output'
            ? `FROM /messages/modules/${sourceNode?.data.label}/outputs/${edgeSource}${conditionNode} INTO ${targetNode?.data.label}`
            : `FROM /messages/modules/${sourceNode?.data.label}/outputs/${edgeSource}${conditionNode} INTO BrokeredEndpoint("/modules/${targetNode?.data.label}/inputs/${edgeSink}")`
        }
      };
      props.setEdges((eds: any) => addEdge(newEdge, eds));
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const nodeTypes = useMemo(() => ({
    default: DefaultNode,
    input: InputNode,
    none: NoneNode,
    output: OutputNode,
   }), []);

  const onConnect = useCallback((params: any) => {
    const targetNode = props.nodes.find((node: any) => node.id === params.target);
    setEdgeConnection(params);
    setEdgeSource("*");
    setEdgeCondition("");
    if (targetNode?.data.label === '$upstream') {
      setEdgeSink("$upstream");
    } else {
      setEdgeSink("input1");
    }
    setIsModalOpen(true);
  }, [props.nodes]);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    const moduleType = event.dataTransfer.getData('module/type');
    const moduleId = event.dataTransfer.getData('module/id');
    const moduleVer = event.dataTransfer.getData('module/version');
    const moduleImg = event.dataTransfer.getData('module/image');
    const moduleSet = event.dataTransfer.getData('module/settings');
    const moduleVar = event.dataTransfer.getData('module/variables');
    if ((typeof moduleType === 'undefined' || !moduleType) || (typeof reactFlowBounds === 'undefined' || !reactFlowBounds)) {
      return;
    }
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    const newNode = {
      id: getNodeId(),
      type: moduleType,
      position,
      sourcePosition: 'right',
      targetPosition: 'left',
      data: {
        label: `${moduleId}`,
        version: `${moduleVer}`,
        settings: `${moduleSet}`,
        variables: `${moduleVar}`,
        image: `${moduleImg}`,
      },
    };
    props.setNodes((nds: any) => nds.concat(newNode));
  }, [reactFlowInstance, props]);

  useEffect(() => {
    let unmounted = false;
    return () => {
      unmounted = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="grow h-full" ref={reactFlowWrapper}>
        <ReactFlow nodes={props.nodes} edges={props.edges} onNodesChange={props.onNodesChange} onEdgesChange={props.onEdgesChange} nodeTypes={nodeTypes} onConnect={onConnect} onInit={setReactFlowInstance} onDrop={onDrop} onDragOver={onDragOver}>
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <Modal title="Declare routes" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <div style={{ padding: "10px" }}>
          From(Source)
          <Input value={edgeSource} onChange={(e: any) => { setEdgeSource(e.target.value) }} />
        </div>
        <div style={{ padding: "10px" }}>
          Where(Condition)
          <Input value={edgeCondition} onChange={(e: any) => { setEdgeCondition(e.target.value) }} placeholder={'NOT IS_DEFINED($connectionModuleId)'} />
        </div>
        <div style={{ padding: "10px" }}>
          To(Sink)
          <Input value={edgeSink} disabled={edgeSink !== '$upstream' ? false : true} onChange={(e: any) => { setEdgeSink(e.target.value) }} />
        </div>
      </Modal>
    </>
  );
}
