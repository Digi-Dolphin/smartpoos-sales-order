import { useContext, useMemo, useState } from "react";
import { Button, TextInput, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Dropdown, DropdownHeader } from "flowbite-react";
import { Plus, Trash2 } from "lucide-react";
import Searchbar from "./components/Searchbar";
import AccessContext from "./AccessContext";
import { url } from "../url";
import axios from "axios";
import Select from 'react-select'
import { useEffect } from "react";
import SalesPDFModal from "./documents/salesPDFModal";
function useAxiosInstance() {
  const { access } = useContext(AccessContext);
  // console.log(access);
  const axiosInstance = axios.create({
    baseURL: `${url}api/`,

  });
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  return axiosInstance;
}


function useItems() {
  const [item, setItems] = useState([]);
  const axiosInstance = useAxiosInstance();
  const [branchId, setBranchId] = useState(localStorage.getItem('branch_id') || '');
  function generateOptions(item) {
    return item.map(item => {
      return {
        "value": item.id,
        "label": item.product.name
      }
    });
  }

  async function searchItems(searchTerm) {
    try {
      const response = await axiosInstance.get(`/search-product-stock/?search_term=${searchTerm}&branch_id=${branchId}`);
      setItems(response.data);
      return generateOptions(response.data);
    }
    catch (err) {
      console.log(err);
    }
  }

  return [item, setItems, searchItems];
}


export default function Item() {
  const [branchId, setBranchId] = useState(localStorage.getItem('branch_id') || '');
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [res, setRes] = useState();
  const [item, , searchItems] = useItems();
  const [customers, setCustomers] = useState([]);
  const axiosInstance = useAxiosInstance();

  const totalItems = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  // Handle adding item to the table
  const handleAddItem = () => {
    if (!selectedItem || !quantity || quantity <= 0) {
      alert("Please select an item and enter a valid quantity");
      return;
    }

    const existingIndex = items.findIndex(
      item => item.id == selectedItem
    );

    if (existingIndex !== -1) {
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += parseFloat(quantity);
      setItems(updatedItems);
    } else {
      // Add new item
      const rawMaterial = item.find(rawMaterial => rawMaterial.id == selectedItem);

      const newItem = {
        id: rawMaterial.id,
        name: rawMaterial.product.name + `(${rawMaterial.product.sku})`,
        quantity: parseFloat(quantity),
        part_numbers: rawMaterial.product.part_numbers_string,
        uom: rawMaterial.product.unit_obj[0].name
      };
      setItems([...items, newItem]);
    }

    // setSelectedItem("");
    setQuantity("");
  };


  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Only allow positive numbers
    if (value === "" || (parseInt(value) > 0 && !isNaN(value))) {
      setQuantity(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddItem();
    }
  };

  async function getCustomers() {
    try {
      const response = await axiosInstance.get(`/customers?branch_id=${branchId}`);
      //map to customer options

      const customerOptions = response.data.map(customer => {
        return ({
          value: customer.id,
          label: customer.name
        })
      });
      setCustomers(customerOptions);
    } catch (err) {
      console.log(err);
    }
  }

  async function submitItems() {
    try {
      const response = await axiosInstance.post('/ordering/create-sales-order/', {
        branch_id: Number(branchId),
        customer_id: customer.value,
        stock_list: items
      });
      console.log(response);

      // alert("Item Consumption Recorded");
      setRes(response.data);
      setOpenModal(true);
      setItems([]);
    }
    catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getCustomers();
  }, []);

  return (
    <div className="w-full h-full space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Sales Order</h2>
        {/* <p className="text-gray-600 mt-1">Search and add materials to your inventory</p> */}
      </div>

      <SalesPDFModal res={res} openModal={openModal} setOpenModal={setOpenModal} />

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer
        </label>
        <Select
          options={customers}
          value={customer}
          onChange={setCustomer}
          placeholder="Select a customer..."
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-end">

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item
          </label>
          <Searchbar
            disabled={!customer}
            placeholder={`${customer ? "Search for Items..." : "Select a customer first"}`}
            onSelect={setSelectedItem}
            searchFunction={searchItems}
          />
        </div>

        <div className="w-full sm:w-32">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <TextInput
            type="number"
            placeholder="Qty"
            value={quantity}
            onChange={handleQuantityChange}
            onKeyPress={handleKeyPress}
            min="1"
            className="w-full"
          />
        </div>

        <div className="w-full sm:w-auto">
          <Button
            onClick={handleAddItem}
            className="w-full sm:w-auto bg-orange-500"
            disabled={!customer || !selectedItem || !quantity || quantity <= 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden flex-1">
        {
          items.length > 0 ? (
            <div className="overflow-x-auto h-full">
              <Table>
                <TableHead>
                  <TableHeadCell className="bg-orange-500 text-white">Item Name</TableHeadCell>
                  <TableHeadCell className="bg-orange-500 text-white">Part Number(s)</TableHeadCell>
                  <TableHeadCell className="bg-orange-500 text-white">Quantity</TableHeadCell>
                  <TableHeadCell className="bg-orange-500 text-white">UOM</TableHeadCell>
                  <TableHeadCell className="bg-orange-500 text-white">Actions</TableHeadCell>
                </TableHead>
                <TableBody className="divide-y">
                  {
                    items.map((item) => (
                      <TableRow key={item.id} className="bg-white hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {item.part_numbers}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {item.uom}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            color="failure"
                            onClick={() => handleRemoveItem(item.id)}
                            className="flex items-center hover:bg-red-500 text-red-500 hover:text-white hover:cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 h-full flex flex-col justify-center">
              <div className="text-gray-400 mb-2">
                <Plus className="w-12 h-12 mx-auto opacity-50" />
              </div>
              <h4 className="text-lg font-medium text-gray-500 mb-1">No items added yet</h4>
              <p className="text-gray-400">Start by searching and adding items above</p>
            </div>
          )}
      </div>

      {
        items.length > 0 && (
          <div className="bg-orange-50 border flex border-orange-200 rounded-lg p-4 ">
            <div className="flex-1 items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-orange-800">Summary</h4>
                <p className="text-orange-600 text-sm mt-1">
                  Total Items: {items.length} |
                  Total Quantity: {(totalItems).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="cursor-pointer bg-orange-500 mt-2" onClick={submitItems}>Create Sales Order</Button>
            </div>
          </div>
        )
      }
    </div>
  );
}