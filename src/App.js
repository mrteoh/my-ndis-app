import React, { useEffect, useState } from "react";
import { Layout, Button, Table, Spin, message, Modal, Form, Input, InputNumber, DatePicker, Switch, Select, notification } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import BigNumber from "bignumber.js";

const { Header, Content, Footer } = Layout;
const { Option } = Select;

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [apiErrorMsg, setApiErrorMsg] = useState('');
  const [form] = Form.useForm();
  

  useEffect(() => {
    fetch("http://localhost:4000/invoices")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch invoices");
        return res.json();
      })
      .then((data) => {
        setData(data.map((row) => ({ ...row, key: row.id })));
      })
      .catch((err) => {
        console.error(err);
        message.error("Failed to load invoices");
      })
      .finally(() => setLoading(false));
  }, []);

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
      render: (value) => (value ? new BigNumber(value).toFormat(2) : "-"),
    },
    {
      title: "NSW",
      dataIndex: "nsw",
      key: "nsw",
      render: (value) => (value ? new BigNumber(value).toFormat(2) : "-"),
    },
    {
      title: "VIC",
      dataIndex: "vic",
      key: "vic",
      render: (value) => (value ? new BigNumber(value).toFormat(2) : "-"),
    },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            setEditingRecord(record);
            form.setFieldsValue({
              ...record,
              start_date: record.start_date ? dayjs(record.start_date) : null,
              end_date: record.end_date ? dayjs(record.end_date) : null,
            });
            setIsModalVisible(true);
          }}
        >
          Edit
        </Button>
      )
    },
  ];

  // Submit form
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
        end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
      };

      if (editingRecord) {
        // UPDATE
        const res = await fetch(`http://localhost:4000/invoices/${editingRecord.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update invoice");

        const updated = await res.json();
        if (updated && updated.id) {
          message.success("Invoice updated successfully");

          // Refresh data from API
          setLoading(true);
          fetch("http://localhost:4000/invoices")
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch invoices");
              return res.json();
            })
            .then((data) => {
              setData(data.map((row) => ({ ...row, key: row.id })));
            })
            .catch((err) => {
              console.error(err);
              message.error("Failed to load invoices");
            })
            .finally(() => setLoading(false));
        }
      } else {
        // CREATE
        const res = await fetch("http://localhost:4000/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          message.error(errorData.error || "Failed to create invoice");
          return;
        }

        const newInvoice = await res.json();
        setData((prev) => [...prev, { ...newInvoice, key: newInvoice.id }]);
        message.success("Invoice created successfully");
      }

      form.resetFields();
      setEditingRecord(null);
      setIsModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to save invoice");
    }
  };


  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ color: "white", fontSize: "20px" }}>
        My NDIS App
      </Header>
      <Content style={{ padding: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
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

      {/* Modal for new invoice */}
      <Modal
        title={editingRecord ? "Edit Invoice" : "Create Invoice"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        okText={editingRecord ? "Update" : "Create"}
        width={900}

      >
        <Form form={form} layout="vertical">
          <div>{apiErrorMsg}</div>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <Form.Item name="support_item_number" label="Support Item #" rules={[{ required: true, message: "Required" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="support_item_name" label="Support Item Name" rules={[{ required: true, message: "Required" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="registration_group_number" label="Reg. Group #" rules={[{ required: true, message: "Required" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="registration_group_name" label="Reg. Group Name" rules={[{ required: true, message: "Required" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="support_category_number" label="Support Cat. #" rules={[{ required: true, message: "Required" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="support_category_number_pace" label="Support Cat. # (PACE)" rules={[{ required: true, message: "Required" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="support_category_name" label="Support Cat. Name" rules={[{ required: true, message: "Required" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="support_category_name_pace" label="Support Cat. Name (PACE)" rules={[{ required: true, message: "Required" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="unit" label="Unit" rules={[{ required: true, message: "Required" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="quote" label="Quote" rules={[{ required: true, message: "Required" }]}>
                <Input />
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item name="start_date" label="Start Date" rules={[{ required: true, message: "Required" }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="end_date" label="End Date" rules={[{ required: true, message: "Required" }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="act" label="ACT" rules={[{ required: true, message: "Required" }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="nsw" label="NSW" rules={[{ required: true, message: "Required" }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="nt" label="NT" rules={[{ required: true, message: "Required" }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="qld" label="QLD" rules={[{ required: true, message: "Required" }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="sa" label="SA" rules={[{ required: true, message: "Required" }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="tas" label="TAS" rules={[{ required: true, message: "Required" }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="vic" label="VIC" rules={[{ required: true, message: "Required" }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="wa" label="WA" rules={[{ required: true, message: "Required" }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item name="remote" label="Remote" rules={[{ required: true, message: "Required" }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="very_remote" label="Very Remote" rules={[{ required: true, message: "Required" }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="non_face_to_face_support_provision" label="Non Face-to-Face Support Provision" valuePropName="checked" rules={[{  message: "Required" }]}>
                <Switch />
              </Form.Item>
              <Form.Item name="provider_travel" label="Provider Travel" valuePropName="checked" rules={[{ message: "Required" }]}>
                <Switch />
              </Form.Item>
              <Form.Item name="short_notice_cancellations" label="Short Notice Cancellations" valuePropName="checked" rules={[{ message: "Required" }]}>
                <Switch />
              </Form.Item>
              <Form.Item name="ndia_requested_reports" label="NDIA Requested Reports" valuePropName="checked" rules={[{ message: "Required" }]}>
                <Switch />
              </Form.Item>
              <Form.Item name="irregular_sil_supports" label="Irregular SIL Supports" valuePropName="checked" rules={[{ message: "Required" }]}>
                <Switch />
              </Form.Item>
              <Form.Item name="type" label="Type" rules={[{ required: true, message: "Required" }]}>
                <Select>
                  <Option value="Service">Service</Option>
                  <Option value="Product">Product</Option>
                </Select>
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
}

export default App;
