import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Layout, Menu, Button, Row, Col, Tag } from "antd";
import type { MenuProps } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, AimOutlined, DeploymentUnitOutlined, RobotOutlined, CheckCircleOutlined } from "@ant-design/icons";
import styles from "./Main.module.css";

const { Header, Sider, Content } = Layout;

const i18nContent: any = {
  "en-US": {
    devices: "Register devices",
    modules: "Manage modules",
    deployments: "Deploy modules",
  },
  "ja-JP": {
    devices: "デバイス登録",
    modules: "モジュール管理",
    deployments: "モジュール展開",
  },
};

export default function MainLayout(props: any) {
  const locale = props.locale;
  const pathname = props.pathname;
  const children = props.children;
  const content: any = i18nContent[locale];
  const [appVersion, setAppVersion] = useState<string>();
  const [collapsed, setCollapsed] = useState(false);
  const [fixedLayoutLeft, setFixedLayoutLeft] = useState(200);
  const items: MenuProps['items'] = [
    {
      key: 'devices',
      icon: <RobotOutlined />,
      label: (
        <Link href={`/devices`} locale={locale} passHref>
          {content.devices}
        </Link>
      )
    },
    {
      key: 'modules',
      icon: <AimOutlined />,
      label: (
        <Link href={`/modules`} locale={locale} passHref>
          {content.modules}
        </Link>
      )
    },
    {
      key: 'deployments',
      icon: <DeploymentUnitOutlined />,
      label: (
        <Link href={`/deployments`} locale={locale} passHref>
          {content.deployments}
        </Link>
      )
    },

  ];

  function toggle() {
    setCollapsed(!collapsed);
    if (collapsed) {
      setFixedLayoutLeft(200);
    } else {
      setFixedLayoutLeft(80);
    }
  }

  const getAppVersion = async () => {
    let response = await fetch('/api/version?' + new URLSearchParams());
    let jsonResponse: any = await response.json();
    setAppVersion(jsonResponse);
  };

  useEffect(() => {
    let unmounted = false;
    if (!unmounted) {
      getAppVersion();
    }
    return () => {
      unmounted = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Layout>
        <Sider trigger={null} collapsible collapsed={collapsed} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
          <div className="h-8 m-4 text-center align-middle bg-yellow-50 text-stone-900">
            {collapsed ? (
              <div className="text-sm items-center inline-flex font-bold h-full">
                <Link href={`/`} locale={locale} passHref>
                  WeDX
                </Link>
              </div>
            ) : (
              <div className="text-xl font-bold">
                <Link href={`/`} locale={locale} passHref>
                  WeDX
                </Link>
              </div>
            )}
          </div>
          <Menu theme="dark" mode="inline" items={items} />
        </Sider>
        <Layout className={styles.siteLayout} style={{ marginLeft: fixedLayoutLeft, height: '100vh' }}>
          <Header className={styles.siteLayoutBackground} style={{ padding: 0 }}>
            <Row>
              <Col span={8}>
                {collapsed ? (
                  <MenuUnfoldOutlined className={styles.trigger} onClick={toggle} />
                ) : (
                  <MenuFoldOutlined className={styles.trigger} onClick={toggle} />
                )}
              </Col>
              <Col span={8} offset={8} className="text-right pr-4">
                <Tag icon={<CheckCircleOutlined />} color="success">{appVersion}</Tag>
                &nbsp;
                <Link href={pathname} locale="en-US" passHref>
                  <Button>EN</Button>
                </Link>
                <Link href={pathname} locale="ja-JP" passHref>
                  <Button>JP</Button>
                </Link>
              </Col>
            </Row>
          </Header>
          <Content className={styles.siteLayoutBackground} style={{ margin: "1px 0px", padding: 0, overflow: 'auto' }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
