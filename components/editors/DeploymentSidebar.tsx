import React, { useState, useEffect, useRef } from "react";
import Image from 'next/image';
import { useRouter } from 'next/router';
import Editor, { Monaco } from "@monaco-editor/react";
import { Drawer, Form, Button } from 'antd';

const initialModules: any = [
  {
    "moduleName": "$upstream (Azure IoT Hub)",
    "moduleVersion": "1.0.0",
    "osPlatform": ["amd64", "arm64v8", "arm32v7"],
    "nodeType": "output",
    "containerId": "$upstream",
    "imageUri": "",
    "iconUri": "module_upstream_128x128.png",
    "restartPolicy": "",
    "desiredStatus": "",
    "imagePullPolicy": "",
    "startupOrder": "",
    "environmentVariables": "{}",
    "containerCreateOptions": "{}",
    "moduleTwinSettings": "{}",
  },
];

const initDeploymentManifest = {
  "modulesContent": {
    "$edgeAgent": {
      "properties.desired": {
        "schemaVersion": "1.1",
        "runtime": {
          "type": "docker",
          "settings": {
            "minDockerVersion": "v1.25",
            "loggingOptions": "",
            "registryCredentials": {
              "ContainerRegistry": {
                "username": "{{ContainerRegistryUsername}}",
                "password": "{{ContainerRegistryPassword}}",
                "address": "{{ContainerRegistryAddress}}"
              }
            }
          }
        },
        "systemModules": {
          "edgeAgent": {
            "type": "docker",
            "settings": {
              "image": "mcr.microsoft.com/azureiotedge-agent:1.2",
              "createOptions": "{}"
            }
          },
          "edgeHub": {
            "type": "docker",
            "settings": {
              "image": "mcr.microsoft.com/azureiotedge-hub:1.2",
              "createOptions": "{\"HostConfig\":{\"PortBindings\":{\"443/tcp\":[{\"HostPort\":\"443\"}],\"5671/tcp\":[{\"HostPort\":\"5671\"}],\"8883/tcp\":[{\"HostPort\":\"8883\"}]}}}"
            },
            "status": "running",
            "restartPolicy": "always",
            "startupOrder": 0
          }
        },
        "modules": {
        }
      }
    },
    "$edgeHub": {
      "properties.desired": {
        "schemaVersion": "1.1",
        "routes": {},
        "storeAndForwardConfiguration": {
          "timeToLiveSecs": 100
        }
      }
    },
  }
};

const onDragStart = (event: any, module: any) => {
  let createOptions = JSON.stringify(JSON.parse(module.containerCreateOptions), null, 0);
  const moduleSettings = {
    "version": "1.0",
    "type": "docker",
    "status": module.desiredStatus,
    "restartPolicy": module.restartPolicy,
    "startupOrder": module.startupOrder,
    "settings": {
      "image": module.imageUri,
      "createOptions": createOptions
    },
    "env": JSON.parse(module.environmentVariables)
  };
  event.dataTransfer.setData('module/type', module.nodeType);
  event.dataTransfer.setData('module/id', module.containerId);
  event.dataTransfer.setData('module/version', module.moduleVersion);
  event.dataTransfer.setData('module/image', module.iconUri);
  event.dataTransfer.setData('module/settings', JSON.stringify(moduleSettings));
  event.dataTransfer.setData('module/variables', module.moduleTwinSettings);
  event.dataTransfer.effectAllowed = 'move';
};

export default function DeploymentSidebarComponent(props: any) {
  const router = useRouter();
  const editorRef = useRef(null);
  const [moduleList, setModuleList] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [deploymentManifest, setDeploymentManifest] = useState('');
  const [form] = Form.useForm();

  const handleDrawerCancel = () => {
    setOpenDrawer(false);
  };

  const handleEditorDidMount = (editor: any, _: Monaco) => {
    editorRef.current = editor;
  }

  const onClickNew = () => {
    props.setNodes([]);
  };

  const onClickDeploy = () => {
    let manifest = JSON.parse(JSON.stringify(initDeploymentManifest));
    props.nodes.map((node: any) => {
      manifest.modulesContent["$edgeAgent"]["properties.desired"]["modules"][node.data.label] = JSON.parse(node.data.settings);
    });
    if (manifest.modulesContent["$edgeAgent"]["properties.desired"]["modules"]["$upstream"]) {
      delete manifest.modulesContent["$edgeAgent"]["properties.desired"]["modules"]["$upstream"];
    }
    props.nodes.forEach((node: any) => {
      if (node.type === 'default' && node.data.variables !== '{}') {
        manifest.modulesContent[node.data.label] = {
          "properties.desired": JSON.parse(node.data.variables)
        };
      };
    });
    props.edges.map((edge: any) => {
      manifest.modulesContent["$edgeHub"]["properties.desired"]["routes"][edge.id] = {};
      manifest.modulesContent["$edgeHub"]["properties.desired"]["routes"][edge.id]["route"] = edge.data.route;
      manifest.modulesContent["$edgeHub"]["properties.desired"]["routes"][edge.id]["priority"] = 0;
      manifest.modulesContent["$edgeHub"]["properties.desired"]["routes"][edge.id]["timeToLiveSecs"] = 1800;
      return null;
    });
    setDeploymentManifest(JSON.stringify(manifest, null, 2));
    setOpenDrawer(true);
  }

  useEffect(() => {
    let tempModuleList = props.moduleList.sort((a: any, b: any) => {
      const nameA = a.moduleName.toUpperCase();
      const nameB = b.moduleName.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    tempModuleList = initialModules.concat(tempModuleList);
    setModuleList(tempModuleList);
  }, [props.moduleList]);

  useEffect(() => {
    let unmounted = false;
    return () => {
      unmounted = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <aside className="border-r text-xs bg-slate-50 min-w-250 overflow-scroll overflow-x-hidden p-3 h-full">
        <div className="flex mb-3">
          <div className="p-1 w-full">
            <Button type="primary" block onClick={onClickNew}>
              New
            </Button>
          </div>
          <div className="p-1 w-full">
            <Button type="primary" block onClick={onClickDeploy}>
              Deploy
            </Button>
          </div>
        </div>
        {
          moduleList.map((module: any, index: any) => {
            const imageSrc = '/images/icons/' + module.iconUri;
            let style = "border border-solid border-stone-400 rounded h-9 p-1 pl-2 flex items-center cursor-grab mb-1";
            if (module.nodeType === 'input') {
              style = "border border-solid border-sky-600 rounded h-9 p-1 pl-2 flex items-center cursor-grab mb-1";
            } else if (module.nodeType === 'output') {
              style = "border border-solid border-rose-600 rounded h-9 p-1 pl-2 flex items-center cursor-grab mb-1";
            }
            return (
              <div className={style} key={index} onDragStart={(event: any) => onDragStart(event, module)} draggable>
                <Image src={imageSrc} width="28" height="28" alt="" className="mr-1" />
                {module.moduleName}
              </div>
            )
          })
        }
      </aside>
      <Drawer title="Deployment Manifest" placement="right" size="large" onClose={handleDrawerCancel} open={openDrawer}>
        <Editor defaultLanguage="json" defaultValue={deploymentManifest} onMount={handleEditorDidMount} />
      </Drawer>
    </>
  );
}
