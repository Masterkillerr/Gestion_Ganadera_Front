import React, { useEffect, useState } from 'react';
import { getResumenProduccion } from '../api/ganado';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const year = new Date().getFullYear();
      const resumen = await getResumenProduccion(year);
      setData(resumen);
    } catch (error) {
      console.error('Error loading report data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando reportes...</div>;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-100">Reportes</h1>
      
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Producción de Leche Mensual</h2>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: '#182118', border: 'none' }} />
              <Line type="monotone" dataKey="leche" stroke="#4eba4e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
