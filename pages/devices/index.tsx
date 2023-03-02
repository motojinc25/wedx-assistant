import React, { useState, useEffect } from 'react';
import Link from "next/link";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { HomeOutlined, RobotOutlined } from "@ant-design/icons";
import { ConfigProvider, Popconfirm, Breadcrumb, Button, Space, message } from 'antd';
import { Table, Drawer, Form, Input } from 'antd';

const DynamicComponentWithNoSSR = dynamic(() => import('../../components/layouts/Main'), {
  ssr: false,
});

const i18nContent: any = {
  "en-US": {
    menuDevices: "Register devices",
    refreshDevice: "Refresh",
    registerDevice: "Register",
    deleteDevice: "Delete",
  },
  "ja-JP": {
    menuDevices: "デバイス登録",
    refreshDevice: "更新",
    registerDevice: "登録",
    deleteDevice: "削除",
  },
};

const asyncForEach = async (array: any, callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const deviceLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

interface DeviceDataType {
  key: React.Key;
  deviceId: string;
  connectionState: string;
  authenticationType: string;
  iotEdge: string;
  moduleList: any;
}

export default function DevicePage(props: any) {
  const router = useRouter();
  const { locale } = props.context;
  const content: any = i18nContent[locale];
  const [messageApi, contextHolder] = message.useMessage();
  const [deviceList, setDeviceList] = useState<DeviceDataType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<DeviceDataType[]>([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>({});

  const columns = [
    {
      title: 'Device ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
      sorter: (a: any, b: any) => a.deviceId.localeCompare(b.deviceId),
      render: (text: string, record: DeviceDataType) => {
        let imageSrc = '/images/icons/device-';
        if (record.iotEdge === 'true') {
          imageSrc = imageSrc + 'edge-';
        }
        if (record.connectionState === 'Connected') {
          imageSrc = imageSrc + 'on.svg';
        } else {
          imageSrc = imageSrc + 'off.svg';
        }
        return (
          <>
            <Image alt="Device Status" className='inline' src={imageSrc} height={15} width={15} /> <a onClick={() => onClickOpenDeviceInfo(text)}>{text}</a>
          </>
        );
      },
    },
    {
      title: 'Connection State',
      dataIndex: 'connectionState',
      key: 'connectionState',
      sorter: (a: any, b: any) => a.connectionState.localeCompare(b.connectionState),
    },
    {
      title: 'Authentication Type',
      dataIndex: 'authenticationType',
      key: 'authenticationType',
      sorter: (a: any, b: any) => a.authenticationType.localeCompare(b.authenticationType),
    },
    {
      title: 'IoT Edge',
      dataIndex: 'iotEdge',
      key: 'iotEdge',
      sorter: (a: any, b: any) => a.iotEdge.localeCompare(b.iotEdge),
    },
  ];

  const onClickOpenDeviceInfo = async (deviceId: any) => {
    let response = await fetch('/api/device/' + deviceId + '?' + new URLSearchParams());
    let jsonResponse: any = await response.json();
    setDeviceInfo(jsonResponse);
    setOpenDrawer(true);
  };

  const expandedRowRender = (record: any, index: any, indent: any, expanded: any) => {
    const columns = [
      { title: 'Module Name', dataIndex: 'moduleId', key: 'moduleId' },
      { title: 'Status', dataIndex: 'status', key: 'status' },
      { title: 'Image', dataIndex: 'image', key: 'image' },
    ];
    return <Table columns={columns} dataSource={record.moduleList} pagination={false} />;
  };

  const handleDrawerCancel = async () => {
    setOpenDrawer(false);
  };

  const getDeviceList = async () => {
    messageApi.open({
      key: 'getdevicelist',
      type: 'loading',
      content: 'Loading...',
    });
    let response = await fetch('/api/device?' + new URLSearchParams());
    let jsonResponse: any = await response.json();
    setDeviceList(jsonResponse);
    messageApi.open({
      key: 'getdevicelist',
      type: 'success',
      content: 'Loaded!',
      duration: 1,
    });
  };

  const registerDevice = async () => {
    messageApi.open({
      key: 'registerdevice',
      type: 'loading',
      content: 'Registering...',
    });
    let url = '/api/device';
    const params = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isEdge: true })
    };
    const response = await fetch(url, params);
    const jsonResponse: any = await response.json();
    setDeviceList([jsonResponse, ...deviceList]);
    messageApi.open({
      key: 'registerdevice',
      type: 'success',
      content: 'Registered!',
      duration: 1,
    });
  };

  const deleteDevice = async () => {
    if (selectedRows.length == 0) {
      messageApi.open({ type: 'error', content: 'No device selected.', duration: 2 });
      return;
    }
    messageApi.open({
      key: 'deletedevice',
      type: 'loading',
      content: 'Deleting...',
    });
    let tempDeviceList: any = deviceList;
    await asyncForEach(selectedRows, async (item: DeviceDataType) => {
      let url = '/api/device/' + item.deviceId;
      const params = {
        method: 'DELETE',
      };
      const response = await fetch(url, params);
      const jsonResponse: any = await response.json();
      tempDeviceList = tempDeviceList.filter((filterItem: any) => filterItem.deviceId !== jsonResponse.deviceId);
    });
    setDeviceList(tempDeviceList);
    setSelectedRows([]);
    messageApi.open({
      key: 'deletedevice',
      type: 'success',
      content: 'Deleted!',
      duration: 1,
    });
  };

  const onExpand = async (expanded: any, record: DeviceDataType) => {
    if (!expanded) {
      return;
    }
    messageApi.open({
      key: 'getmodulelist',
      type: 'loading',
      content: 'Loading...',
    });
    const tempDeviceList = [...deviceList];
    const tempIndex = tempDeviceList.findIndex((element: DeviceDataType) => element.deviceId == record.deviceId);
    let response = await fetch('/api/device/' + record.deviceId + '/module/?' + new URLSearchParams());
    let jsonResponse: any = await response.json();
    tempDeviceList[tempIndex].moduleList = jsonResponse;
    setDeviceList(tempDeviceList);
    messageApi.open({
      key: 'getmodulelist',
      type: 'success',
      content: 'Loaded!',
      duration: 1,
    });
  };

  const onSelectChange = (selectedRowKeys: React.Key[], selectedRows: DeviceDataType[]) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
  };

  useEffect(() => {
    let unmounted = false;
    if (!unmounted) {
      getDeviceList();
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
              <Link href={`/devices`} locale={locale} passHref>
                <RobotOutlined /> {content.menuDevices}
              </Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        </nav>
        <section>
          <Space wrap className="ml-2">
            <ConfigProvider autoInsertSpaceInButton={false}>
              <Button onClick={() => { getDeviceList() }}>
                {content.refreshDevice}
              </Button>
              <Popconfirm title="Are you sure?" okText="Yes" cancelText="No" onConfirm={() => { registerDevice() }}>
                <Button>
                  {content.registerDevice}
                </Button>
              </Popconfirm>
              <Popconfirm title="Are you sure?" okText="Yes" cancelText="No" onConfirm={() => { deleteDevice() }}>
                <Button>
                  {content.deleteDevice}
                </Button>
              </Popconfirm>
            </ConfigProvider>
          </Space>
          <Table columns={columns} dataSource={deviceList}
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectChange,
            }}
            expandable={{
              rowExpandable: record => record.connectionState !== 'Disconnected',
              expandedRowRender: expandedRowRender,
              onExpand: onExpand,
            }}
          />
        </section>
        <aside>
          <Drawer title="Device Information" placement="right" size="large" onClose={handleDrawerCancel} open={openDrawer}>
            <Form {...deviceLayout} name="control-device">
              <Form.Item label="Device ID">
                <Input disabled={true} defaultValue={deviceInfo.deviceId} />
              </Form.Item>
              <Form.Item label="Connection String">
                <Input disabled={true} defaultValue={deviceInfo.primaryConnectionString} />
              </Form.Item>
              <Form.Item label="Symmetric Key">
                <Input disabled={true} defaultValue={deviceInfo.primarySymmetricKey} />
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
