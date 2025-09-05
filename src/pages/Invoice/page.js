import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Table,
  Spin,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Switch,
  Select,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import BigNumber from "bignumber.js";
import axios from "axios";

const { Header, Content, Footer } = Layout;
const { Option } = Select;

const InvoicePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  // Invoice modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // XLSX modal state
  const [isXlsxModalVisible, setIsXlsxModalVisible] = useState(false);

  const [form] = Form.useForm();

  const GET_INVOICE_URL = "http://localhost:4000/invoices";

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
      ),
    },
  ];

  const typeOptions = [
    "Price Limited Supports",
    "Quotable Supports",
    "Unit Price = $1",
    " ",
  ];

  useEffect(() => {
    fetch(GET_INVOICE_URL)
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

  // Submit invoice form (unchanged)
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
        const res = await fetch(`${GET_INVOICE_URL}/${editingRecord.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update invoice");

        const updated = await res.json();
        if (updated && updated.id) {
          message.success("Invoice updated successfully");
          setLoading(true);
          fetch(GET_INVOICE_URL)
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
        const res = await fetch(GET_INVOICE_URL, {
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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      message.error("Please select an XLSX file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:4000/upload-xlsx", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success(
        `✅ Uploaded: ${res.data.fileName} — ${res.data.totalTransactions} transactions found`
      );
      setIsXlsxModalVisible(false); // close modal
      setSelectedFile(null); // reset
    } catch (err) {
      console.error("❌ Upload failed:", err);
      message.error("Upload failed, please try again");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ color: "white", fontSize: "20px" }}>My NDIS App</Header>
      <Content style={{ padding: "20px" }}>
        <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRecord(null);
                form.resetFields();
                setIsModalVisible(true);
                }}
              >
                Add Invoice
              </Button>
              </div>
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                setSelectedFile(null); // reset selectedFile
                setIsXlsxModalVisible(true); // open XLSX modal
                }}
              >
                Import XLSX
              </Button>
              </div>
            </div>

            {loading ? <Spin size="large" /> : <Table columns={columns} dataSource={data} />}
            </Content>
            <Footer style={{ textAlign: "center" }}>My NDIS App ©2025 Created with Ant Design</Footer>

            {/* ✅ Modal for Import XLSX */}
      <Modal
        title="Import XLSX"
        open={isXlsxModalVisible}
        onCancel={() => setIsXlsxModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsXlsxModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="upload" type="primary" onClick={handleUpload}>
            Upload
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Upload XLSX">
            <input type="file" accept=".xlsx" onChange={handleFileChange} />
          </Form.Item>
        </Form>
      </Modal>


      {/* Existing modal for invoices (unchanged) */}
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
          <div style={{ display: "flex", gap: 24 }}>
              <div style={{ flex: 1 }}>
                <Form.Item name="unit" label="Unit" rules={[{ required: true, message: "Required" }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="invoice_rate" label="Invoice Rate" rules={[{ required: true, message: "Required" }]}>
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="invoice_number" label="Invoice Number" rules={[{ required: true, message: "Required" }]}>
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>

                {
                  editingRecord && 
                    <Form.Item name="invoice_amount" label="Invoice Amount" rules={[{ required: true, message: "Required" }]}>
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                }
              </div>
              <div style={{ flex: 1 }}>
                <Form.Item name="support_category_number" label="Support Cat. #" rules={[{ required: true, message: "Required" }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="support_category_name" label="Support Cat. Name" rules={[{ required: true, message: "Required" }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="start_date" label="Start Date" rules={[{ required: true, message: "Required" }]}>
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="end_date" label="End Date" rules={[{ required: true, message: "Required" }]}>
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="support_item_number" label="Support Item #" rules={[{ required: true, message: "Required" }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="support_item_name" label="Support Item Name" rules={[{ required: true, message: "Required" }]}>
                    <Input />
                </Form.Item>
              </div>
              <div style={{ flex: 1 }}>
                <Form.Item name="registration_group_number" label="Reg. Group #" rules={[{ required: true, message: "Required" }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="registration_group_name" label="Reg. Group Name" rules={[{ required: true, message: "Required" }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="max_rate" label="Max Rate" rules={[{ required: true, message: "Required" }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                  name="type"
                  label="Type"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Select placeholder="Select type">
                    {typeOptions.map((opt) => (
                      <Select.Option key={opt} value={opt}>
                        {opt || "(Empty)"}   {/* Show label for empty string */}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
          </Form>
      </Modal>
    </Layout>
  );
};

export default InvoicePage;
