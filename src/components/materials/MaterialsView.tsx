import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Package } from 'lucide-react';

export const MaterialsView: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Materials & Stock</h2>
          <p className="text-gray-600 mt-1">Manage educational materials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((item) => (
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
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
