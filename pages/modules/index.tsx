import React, { useState, useEffect } from 'react';
import Link from "next/link";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { HomeOutlined, AimOutlined } from "@ant-design/icons";
import { ConfigProvider, Popconfirm, Breadcrumb, Button, Space, message } from 'antd';
import { Table, Drawer, Form, Input, Radio, Select, Checkbox } from 'antd';

const DynamicComponentWithNoSSR = dynamic(() => import('../../components/layouts/Main'), {
  ssr: false,
});

const i18nContent: any = {
  "en-US": {
    menuModules: "Manage modules",
    refreshModule: "Refresh",
    registerModule: "Register",
    deleteModule: "Delete",
  },
  "ja-JP": {
    menuModules: "モジュール管理",
    refreshModule: "更新",
    registerModule: "登録",
    deleteModule: "削除",
  },
};

const asyncForEach = async (array: any, callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const { Option } = Select;

const { TextArea } = Input;

const moduleLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

interface ModuleDataType {
  key: React.Key;
  moduleId: string;
  moduleName: string;
  moduleVersion: string;
  nodeType: string;
}

export default function ModulePage(props: any) {
  const router = useRouter();
  const { locale } = props.context;
  const content: any = i18nContent[locale];
  const [messageApi, contextHolder] = message.useMessage();
  const [moduleList, setModuleList] = useState<ModuleDataType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<ModuleDataType[]>([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [formRegisterModule] = Form.useForm();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'moduleId',
      key: 'moduleId',
      sorter: (a: any, b: any) => a.moduleId.localeCompare(b.moduleId),
    },
    {
      title: 'Name',
      dataIndex: 'moduleName',
      key: 'moduleName',
      sorter: (a: any, b: any) => a.moduleName.localeCompare(b.moduleName),
    },
    {
      title: 'Version',
      dataIndex: 'moduleVersion',
      key: 'moduleVersion',
      sorter: (a: any, b: any) => a.moduleVersion.localeCompare(b.moduleVersion),
    },
    {
      title: 'Type',
      dataIndex: 'nodeType',
      key: 'nodeType',
      sorter: (a: any, b: any) => a.nodeType.localeCompare(b.nodeType),
    },
  ];

  const handleDrawerCancel = async () => {
    setOpenDrawer(false);
  };

  const handleDrawerRegisterModule = async () => {
    formRegisterModule.submit();
  };

  const onFormRegisterModule = async (values: any) => {
    messageApi.open({
      key: 'registermodule',
      type: 'loading',
      content: 'Registering...',
    });
    setOpenDrawer(false);
    const url = '/api/module';
    const params = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values }),
    };
    const response = await fetch(url, params);
    const jsonResponse: any = await response.json();
    setModuleList([jsonResponse, ...moduleList]);
    formRegisterModule.resetFields();
    messageApi.open({
      key: 'registermodule',
      type: 'success',
      content: 'Registered!',
      duration: 1,
    });
  }

  const onFormReset = async () => {
    formRegisterModule.resetFields();
  };

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

  const deleteModule = async () => {
    if (selectedRows.length == 0) {
      messageApi.open({ type: 'error', content: 'No module selected.', duration: 2 });
      return;
    }
    messageApi.open({
      key: 'deletemodule',
      type: 'loading',
      content: 'Deleting...',
    });
    let tempModuleList = moduleList;
    await asyncForEach(selectedRows, async (item: ModuleDataType) => {
      const url = '/api/module/' + item.moduleId;
      const params = {
        method: 'DELETE',
      };
      const response = await fetch(url, params);
      const jsonResponse: any = await response.json();
      tempModuleList = tempModuleList.filter((filterItem) => filterItem.moduleId !== jsonResponse.moduleId);
    });
    setModuleList(tempModuleList);
    setSelectedRows([]);
    messageApi.open({
      key: 'deletedevice',
      type: 'success',
      content: 'Deleted!',
      duration: 1,
    });
  }

  const onSelectChange = (selectedRowKeys: React.Key[], selectedRows: ModuleDataType[]) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
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
        <nav className="mt-1 ml-3">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href={`/`} locale={locale} passHref>
                <HomeOutlined />
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href={`/modules`} locale={locale} passHref>
                <AimOutlined /> {content.menuModules}
              </Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        </nav>
        <section>
          <Space wrap className="ml-2">
            <ConfigProvider autoInsertSpaceInButton={false}>
              <Button onClick={() => { getModuleList() }}>
                {content.refreshModule}
              </Button>
              <Button onClick={() => { setOpenDrawer(true) }}>
                {content.registerModule}
              </Button>
              <Popconfirm title="Are you sure?" okText="Yes" cancelText="No" onConfirm={() => { deleteModule() }}>
                <Button>
                  {content.deleteModule}
                </Button>
              </Popconfirm>
            </ConfigProvider>
          </Space>
          <Table columns={columns} dataSource={moduleList}
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectChange,
            }}
          />
        </section>
        <aside>
          <Drawer title="Register Module" placement="right" size="large" onClose={handleDrawerCancel} open={openDrawer}
            extra={
              <Space>
                <Button onClick={handleDrawerCancel}>Cancel</Button>
                <Button onClick={onFormReset}>Reset</Button>
                <Button type="primary" onClick={handleDrawerRegisterModule}>Submit</Button>
              </Space>
            }
          >
            <Form {...moduleLayout} form={formRegisterModule} name="control-hooks" onFinish={onFormRegisterModule} initialValues={{ osPlatform: "amd64", nodeType: "default", restartPolicy: "always", desiredStatus: "running", imagePullPolicy: "on-create", startupOrder: "200", environmentVariables: "{}", containerCreateOptions: "{}", moduleTwinSettings: "{}" }}>
              <Form.Item name="moduleName" label="Module Name" rules={[{ required: true }]}>
                <Input placeholder="WeDXModule" />
              </Form.Item>
              <Form.Item name="moduleVersion" label="Module Version" rules={[{ required: true }]}>
                <Input placeholder="1.0.0" />
              </Form.Item>
              <Form.Item name="osPlatform" label="OS Platform" rules={[{ required: true }]}>
                <Checkbox.Group>
                  <Checkbox value="amd64">AMD64</Checkbox>
                  <Checkbox value="arm32v7">ARM32v7</Checkbox>
                  <Checkbox value="arm64v8">ARM64</Checkbox>
                </Checkbox.Group>
              </Form.Item>
              <Form.Item name="nodeType" label="Node Type">
                <Radio.Group>
                  <Radio.Button value="default">Default</Radio.Button>
                  <Radio.Button value="input">Input</Radio.Button>
                  <Radio.Button value="output">Output</Radio.Button>
                  <Radio.Button value="none">None</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Form.Item name="containerId" label="Container ID" rules={[{ required: true }]}>
                <Input placeholder="wedxmodule" />
              </Form.Item>
              <Form.Item name="imageUri" label="Image URI" rules={[{ required: true }]}>
                <Input placeholder='mcr.microsoft.com/wedxmodule:1.0' />
              </Form.Item>
              <Form.Item name="iconUri" label="Icon URI" rules={[{ required: true }]}>
                <Input placeholder='icon_128x128.png' />
              </Form.Item>
              <Form.Item name="restartPolicy" label="Restart Policy">
                <Select placeholder="Select a option and change input text above" allowClear>
                  <Option value="never">never</Option>
                  <Option value="on-failure">on-failure</Option>
                  <Option value="on-unhealthy">on-unhealthy</Option>
                  <Option value="always">always</Option>
                </Select>
              </Form.Item>
              <Form.Item name="desiredStatus" label="Desired Status">
                <Select placeholder="Select a option and change input text above" allowClear>
                  <Option value="running">running</Option>
                  <Option value="stopped">stopped</Option>
                </Select>
              </Form.Item>
              <Form.Item name="imagePullPolicy" label="Image Pull Policy">
                <Select placeholder="Select a option and change input text above" allowClear>
                  <Option value="on-create">on-create</Option>
                  <Option value="never">never</Option>
                </Select>
              </Form.Item>
              <Form.Item name="startupOrder" label="Startup Order" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="environmentVariables" label="Environment Variables" rules={[{ required: true }]}>
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item name="containerCreateOptions" label="Create Options" rules={[{ required: true }]}>
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item name="moduleTwinSettings" label="Module Twin Settings" rules={[{ required: true }]}>
                <TextArea rows={4} />
              </Form.Item>
            </Form>
          </Drawer>
        </aside>
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
