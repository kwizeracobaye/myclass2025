import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Package, CreditCard as Edit2, Trash2, Search, Filter } from 'lucide-react';

interface Material {
  id: string;
  material_name: string;
  category: string;
  quantity: number;
  location: string;
  status: string;
}

export const MaterialsView: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const { data } = await supabase.from('materials').select('*').order('material_name');
    setMaterials(data || []);
    setLoading(false);
  };

  const updateQuantity = async (id: string, newQty: number) => {
    const status = newQty === 0 ? 'out_of_stock' : newQty < 10 ? 'low_stock' : 'available';
    await supabase.from('materials').update({ quantity: newQty, status }).eq('id', id);
    loadMaterials();
  };

  const handleSaveMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const quantity = parseInt(formData.get('quantity') as string);
    const status = quantity === 0 ? 'out_of_stock' : quantity < 10 ? 'low_stock' : 'available';

    const materialData = {
      material_name: formData.get('material_name') as string,
      category: formData.get('category') as string,
      quantity,
      location: formData.get('location') as string,
      status,
    };

    try {
      if (editingMaterial) {
        await supabase.from('materials').update(materialData).eq('id', editingMaterial.id);
      } else {
        await supabase.from('materials').insert([materialData]);
      }
      setShowModal(false);
      setEditingMaterial(null);
      loadMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      await supabase.from('materials').delete().eq('id', id);
      loadMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const categories = Array.from(new Set(materials.map((m) => m.category)));

  const filteredMaterials = materials.filter((material) => {
    if (searchTerm && !material.material_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !material.category.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterCategory !== 'all' && material.category !== filterCategory) return false;
    if (filterStatus !== 'all' && material.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Materials & Stock</h2>
          <p className="text-gray-600 mt-1">Manage educational materials and inventory</p>
        </div>
        <button
          onClick={() => {
            setEditingMaterial(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Material
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.material_name}</h3>
                <p className="text-sm text-gray-600">{item.category}</p>
                <p className="text-xs text-gray-500 mt-1">{item.location}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{item.quantity}</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'low_stock'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    +
                  </button>
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      setEditingMaterial(item);
                      setShowModal(true);
                    }}
                    className="ml-auto p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMaterial(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No materials found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingMaterial ? 'Edit Material' : 'Add New Material'}
            </h3>
            <form onSubmit={handleSaveMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Name</label>
                <input
                  type="text"
                  name="material_name"
                  defaultValue={editingMaterial?.material_name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  defaultValue={editingMaterial?.category}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Stationery, Lab Equipment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  defaultValue={editingMaterial?.quantity || 0}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={editingMaterial?.location}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Storage Room A"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMaterial(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingMaterial ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
