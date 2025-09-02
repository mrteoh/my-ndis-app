import React, { useEffect, useState } from "react";
import { Layout, Button, Table, Spin, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import BigNumber from "bignumber.js";

const { Header, Content, Footer } = Layout;

const columns = [
  { title: "ID", dataIndex: "id", key: "id" },
  { title: "Support Item #", dataIndex: "support_item_number", key: "support_item_number" },
  { title: "Support Item Name", dataIndex: "support_item_name", key: "support_item_name" },
  { title: "Reg. Group #", dataIndex: "registration_group_number", key: "registration_group_number" },
  { title: "Reg. Group Name", dataIndex: "registration_group_name", key: "registration_group_name" },
  { title: "Support Cat. #", dataIndex: "support_category_number", key: "support_category_number" },
  { title: "Support Cat. Name", dataIndex: "support_category_name", key: "support_category_name" },
  {
    title: "Start Date",
    dataIndex: "start_date",
    key: "start_date",
    render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
  },
  {
    title: "End Date",
    dataIndex: "end_date",
    key: "end_date",
    render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
  },
  {
    title: "ACT",
    dataIndex: "act",
    key: "act",
    render: (value) => value ? new BigNumber(value).toFormat(2) : "-",
  },
  {
    title: "NSW",
    dataIndex: "nsw",
    key: "nsw",
    render: (value) => value ? new BigNumber(value).toFormat(2) : "-",
  },
  {
    title: "VIC",
    dataIndex: "vic",
    key: "vic",
    render: (value) => value ? new BigNumber(value).toFormat(2) : "-",
  },
  { title: "Type", dataIndex: "type", key: "type" },
];

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/invoices")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch invoices");
        return res.json();
      })
      .then((data) => {
        // Ensure each row has a `key`
        const formatted = data.map((row) => ({
          ...row,
          key: row.id,
        }));
        setData(formatted);
      })
      .catch((err) => {
        console.error(err);
        message.error("Failed to load invoices");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ color: "white", fontSize: "20px" }}>
        My NDIS App
      </Header>
      <Content style={{ padding: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Invoice
          </Button>
        </div>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Table columns={columns} dataSource={data} />
        )}
      </Content>
      <Footer style={{ textAlign: "center" }}>
        My NDIS App ©2025 Created with Ant Design
      </Footer>
    </Layout>
  );
}

export default App;
