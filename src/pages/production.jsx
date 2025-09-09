import { useMemo, useState, useContext } from "react";
import { Button, TextInput, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Plus, Trash2 } from "lucide-react";

// Import the Searchbar component (assuming it's in the same directory)
import Searchbar from "./components/Searchbar";
import AccessContext from "./AccessContext";
import axios from "axios";
import { url } from "../url";
import FinishedProductsPdf from "./documents/finishProductsPdfModal";

// async function searchRawMaterials(searchTerm) {
//   try {
//     const response = await axiosInstance.get(`/search-raw-material-stock/?search_term=${searchTerm}`);

//     return response.data;
//   }
//   catch(err) {
//     console.log(err);
//   }
// }
function useAxiosInstance() {
  const { access } = useContext(AccessContext);
  const axiosInstance = axios.create({
    baseURL: `${url}api/manufacturing/`,
    headers: {
      'Authorization': `Bearer ${access}`
    }
  });
  return axiosInstance;
}

function useRawMaterials() {
  const [rawMaterials, setRawMaterials] = useState([]);
  const axiosInstance = useAxiosInstance();

  function generateOptions(rawMaterials) {
    return rawMaterials.map(rawMaterial => {
      return {
        "value": rawMaterial.id,
        "label": rawMaterial.name
      }
    });
  }

  async function searchRawMaterials(searchTerm) {
    try {
      const response = await axiosInstance.get(`/search-finished-products/?search_term=${searchTerm}`);
  
      setRawMaterials(response.data.finished_products);

      return generateOptions(response.data.finished_products);
    }
    catch(err) {
      console.log(err);
    }
  }

  return [rawMaterials, setRawMaterials, searchRawMaterials];
}


export default function ProduceFinishedProducts() {
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [materials, setMaterials] = useState([]);

  const axiosInstance = useAxiosInstance();

  const [res, setRes] = useState();
  const [openModal, setOpenModal] = useState(false);

  const [rawMaterials, setRawMaterials, searchRawMaterials] = useRawMaterials();

  const totalMaterials = useMemo(() => {
    return materials.reduce((total, material) => total + material.quantity, 0);
  }, [materials]);
  
  // Handle adding material to the table
  const handleAddMaterial = () => {
    if (!selectedMaterial || !quantity || quantity <= 0) {
      alert("Please select a material and enter a valid quantity");
      return;
    }
    
    const existingIndex = materials.findIndex(
      material => material.id == selectedMaterial
    );
    
    if (existingIndex !== -1) {
      const updatedMaterials = [...materials];
      updatedMaterials[existingIndex].quantity += parseFloat(quantity);
      setMaterials(updatedMaterials);
    } else {
      // Add new material
      const rawMaterial = rawMaterials.find(rawMaterial => rawMaterial.id == selectedMaterial);

      const newMaterial = {
        id: rawMaterial.id,
        raw_material_id: rawMaterial.id,
        name: rawMaterial.name,
        quantity: parseFloat(quantity),
        uom: rawMaterial.unit_obj[0].name
      };
      setMaterials([...materials, newMaterial]);
    }
    
    // setSelectedMaterial("");
    setQuantity("");
  };
  

  const handleRemoveMaterial = (id) => {
    setMaterials(materials.filter(material => material.id !== id));
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
      handleAddMaterial();
    }
  };

  async function submitMaterials() {
    try {
      const response = await axiosInstance.post('create-production/', {
        total_quantity_used: totalMaterials,
        products: materials
      });
      console.log(response);

      // alert("Finished Product Produced");
      setRes(response.data);
      setOpenModal(true);
      setMaterials([]);
    }
    catch(err) {
      console.log(err);
    }
  }
  
  return (
    <div className="w-full space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Production Management</h2>
        {/* <p className="text-gray-600 mt-1">Search and add materials to your inventory</p> */}
      </div>

      <FinishedProductsPdf res={res} openModal={openModal} setOpenModal={setOpenModal} />
      
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product
          </label>
          <Searchbar
            placeholder="Search for products..."
            onSelect={setSelectedMaterial}
            searchFunction={searchRawMaterials}
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
            onClick={handleAddMaterial}
            className="w-full sm:w-auto bg-green-500"
            disabled={!selectedMaterial || !quantity || quantity <= 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Material
          </Button>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">        
        {
          materials.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableHeadCell className="bg-green-500 text-white">Material Name</TableHeadCell>
                  <TableHeadCell className="bg-green-500 text-white">Quantity</TableHeadCell>
                  <TableHeadCell className="bg-green-500 text-white">UOM</TableHeadCell>
                  <TableHeadCell className="bg-green-500 text-white">Actions</TableHeadCell>
                </TableHead>
                <TableBody className="divide-y">
                  {
                    materials.map((material) => (
                      <TableRow key={material.id} className="bg-white hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">
                          {material.name}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {material.quantity}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {material.uom}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            color="failure"
                            onClick={() => handleRemoveMaterial(material.id)}
                            className="flex items-center"
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
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Plus className="w-12 h-12 mx-auto opacity-50" />
            </div>
            <h4 className="text-lg font-medium text-gray-500 mb-1">No products added yet</h4>
            <p className="text-gray-400">Start by searching and adding products above</p>
          </div>
        )}
      </div>
      
      {
        materials.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-green-800">Summary</h4>
                <p className="text-green-600 text-sm mt-1">
                  Total Materials: {materials.length} | 
                  Total Quantity: {(totalMaterials).toLocaleString()}
                </p>
              </div>
            </div>

            <Button className="cursor-pointer bg-green-500 mt-2" onClick={submitMaterials}>Produce</Button>
          </div>
        )
      }
    </div>
  );
}