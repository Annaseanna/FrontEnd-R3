import React, { useState, useEffect } from 'react';
import { BarChart2, Image, ShoppingBag, TrendingUp, Users, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService } from './services/apiService';

function App() {
    // Estados para pestañas
    const [activeTab, setActiveTab] = useState('sales');
    const [recommendationTab, setRecommendationTab] = useState('user');

    // Estados para datos de validación
    const [validData, setValidData] = useState(null);

    // Estados para predicción de ventas
    const [selectedStore, setSelectedStore] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [salesPrediction, setSalesPrediction] = useState(null);
    const [salesChartData, setSalesChartData] = useState([]);

    // Estados para recomendaciones
    const [userId, setUserId] = useState('');
    const [productHistory, setProductHistory] = useState('');
    const [recommendations, setRecommendations] = useState([]);

    // Estados para clasificación de imágenes
    const [classificationResult, setClassificationResult] = useState(null);

    // Estados generales
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar datos válidos al iniciar
    useEffect(() => {
        const loadValidData = async () => {
            try {
                // Definir los valores de tiendas y departamentos
                const validStores = Array.from({ length: 45 }, (_, i) => i + 1); // Tiendas del 1 al 45
                const validDepartments = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 44, 45, 46, 47, 48, 49, 51, 52, 54, 55, 56, 58, 59, 60, 67, 71, 72, 74, 77, 78, 79, 80, 81, 82, 83, 85, 87, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 39, 50, 43, 65];

                // Definir el rango de fechas
                const dateRange = {
                    min_date: '2010-02-05',
                    max_date: '2013-07-26'
                };

                // Establecer los datos en el estado
                setValidData({
                    valid_stores: validStores,
                    valid_departments: validDepartments,
                    date_range: dateRange
                });
            } catch (error) {
                setError('Error cargando datos iniciales');
                console.error('Error:', error);
            }
        };
        loadValidData();
    }, []);

    // Manejador para predicción de ventas
    const handlePredictSales = async () => {
        if (!selectedStore || !selectedDept || !selectedDate) {
            setError('Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const prediction = await apiService.predictSales(selectedStore, selectedDept, selectedDate);
            setSalesPrediction(prediction);

            // Actualizar datos del gráfico
            setSalesChartData([
                { name: 'Predicción Base', ventas: prediction.base_prediction },
                { name: 'Predicción Ajustada', ventas: prediction.adjusted_prediction },
                { name: 'Predicción Final', ventas: prediction.final_prediction }
            ]);
        } catch (error) {
            setError('Error al obtener la predicción');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Manejador para clasificación de imágenes
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setClassificationResult(null);

        try {
            const result = await apiService.classifyImage(file);
            setClassificationResult(result);
        } catch (error) {
            setError('Error al clasificar la imagen');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Manejador para recomendaciones
    const handleGetRecommendations = async () => {
        setLoading(true);
        setError(null);

        try {
            let result;
            if (recommendationTab === 'user' && userId) {
                result = await apiService.getRecommendationsByUser(parseInt(userId));
            } else if (recommendationTab === 'history' && productHistory) {
                const productIds = productHistory.split(',').map(id => parseInt(id.trim()));
                result = await apiService.getRecommendationsByHistory(productIds);
            } else if (recommendationTab === 'popular') {
                result = await apiService.getPopularRecommendations();
            } else {
                setError('Por favor ingresa los datos necesarios');
                setLoading(false);
                return;
            }

            setRecommendations(result.recommendations);
        } catch (error) {
            setError('Error al obtener recomendaciones');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gray-900 text-gray-100 flex flex-col">
            <header className="bg-gray-800 p-4 border-b border-gray-700">
                <h1 className="text-2xl font-bold">Ecommerce Intelligence</h1>
            </header>

            <nav className="bg-gray-800 p-3 border-b border-gray-700">
                <div className="flex gap-4 flex-wrap">
                    <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            activeTab === 'sales'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-700'
                        }`}
                        onClick={() => setActiveTab('sales')}
                    >
                        <BarChart2 size={20} />
                        <span>Predicción de Ventas</span>
                    </button>

                    <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            activeTab === 'classification'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-700'
                        }`}
                        onClick={() => setActiveTab('classification')}
                    >
                        <Image size={20} />
                        <span>Clasificación de Productos</span>
                    </button>

                    <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            activeTab === 'recommendations'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-700'
                        }`}
                        onClick={() => setActiveTab('recommendations')}
                    >
                        <ShoppingBag size={20} />
                        <span>Recomendaciones</span>
                    </button>
                </div>
            </nav>

            {error && (
                <div className="bg-red-500 text-white p-2 text-center">
                    {error}
                </div>
            )}

            <main className="flex-1 overflow-auto">
                <div className="p-4 h-full">
                    {/* Pestaña de Predicción de Ventas */}
                    {activeTab === 'sales' && (
                        <div className="space-y-4 h-full flex flex-col">
                            <h2 className="text-xl font-bold">Predicción de Ventas</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <div className="flex items-start space-x-4">
                                        <TrendingUp className="text-blue-500" size={24} />
                                        <div>
                                            <h3 className="text-gray-400 text-sm">Predicción Base</h3>
                                            <p className="text-2xl font-bold">
                                                ${salesPrediction?.base_prediction.toFixed(2) || '0.00'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <div className="flex items-start space-x-4">
                                        <Users className="text-blue-500" size={24} />
                                        <div>
                                            <h3 className="text-gray-400 text-sm">Predicción Ajustada</h3>
                                            <p className="text-2xl font-bold">
                                                ${salesPrediction?.adjusted_prediction.toFixed(2) || '0.00'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <div className="flex items-start space-x-4">
                                        <Package className="text-blue-500" size={24} />
                                        <div>
                                            <h3 className="text-gray-400 text-sm">Predicción Final</h3>
                                            <p className="text-2xl font-bold">
                                                ${salesPrediction?.final_prediction.toFixed(2) || '0.00'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <select
                                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 min-w-[200px]"
                                    value={selectedStore}
                                    onChange={(e) => setSelectedStore(e.target.value)}
                                >
                                    <option value="">Selecciona una tienda</option>
                                    {validData?.valid_stores.map((store) => (
                                        <option key={store} value={store}>
                                            Tienda {store}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 min-w-[200px]"
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                >
                                    <option value="">Selecciona un departamento</option>
                                    {validData?.valid_departments.map((dept) => (
                                        <option key={dept} value={dept}>
                                            Departamento {dept}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="date"
                                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={validData?.date_range.min_date}
                                    max={validData?.date_range.max_date}
                                />

                                <button
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    onClick={handlePredictSales}
                                    disabled={loading}
                                >
                                    {loading ? 'Prediciendo...' : 'Predecir'}
                                </button>
                            </div>

                            <div className="bg-gray-800 p-4 rounded-lg flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={salesChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="name" stroke="#9CA3AF" />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                color: '#F3F4F6'
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="ventas"
                                            stroke="#3B82F6"
                                            strokeWidth={2}
                                            dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Pestaña de Clasificación */}
                    {activeTab === 'classification' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Clasificación de Productos</h2>
                            <div className="bg-gray-800 rounded-lg p-8">
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center">
                                    <Image className="mx-auto text-gray-500 mb-4" size={48} />
                                    <p className="text-gray-400 mb-4">
                                        Arrastra una imagen o haz click para seleccionar
                                    </p>
                                    <input
                                        type="file"
                                        id="image-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                                    >
                                        {loading ? 'Procesando...' : 'Seleccionar Archivo'}
                                    </label>
                                </div>

                                {classificationResult && (
                                    <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-2">Resultado:</h3>
                                        <p>Clase: {classificationResult.predicted_class}</p>
                                        <p>Confianza: {(classificationResult.confidence * 100).toFixed(2)}%</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pestaña de Recomendaciones */}
                    {activeTab === 'recommendations' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Sistema de Recomendaciones</h2>
                            <div className="border-b border-gray-700 mb-6">
                                <div className="flex gap-4">
                                    <button
                                        className={`px-4 py-2 border-b-2 ${
                                            recommendationTab === 'user'
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-400 hover:text-gray-300'
                                        }`}
                                        onClick={() => setRecommendationTab('user')}
                                    >
                                        Por Usuario
                                    </button>
                                    <button
                                        className={`px-4 py-2 border-b-2 ${
                                            recommendationTab === 'history'
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-400 hover:text-gray-300'
                                        }`}
                                        onClick={() => setRecommendationTab('history')}
                                    >
                                        Por Historial
                                    </button>
                                    <button
                                        className={`px-4 py-2 border-b-2 ${
                                            recommendationTab === 'popular'
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-400 hover:text-gray-300'
                                        }`}
                                        onClick={() => setRecommendationTab('popular')}
                                    >
                                        Productos Populares
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                {recommendationTab === 'user' && (
                                    <input
                                        type="text"
                                        placeholder="ID del usuario"
                                        className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 flex-1"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                    />
                                )}
                                {recommendationTab === 'history' && (
                                    <textarea
                                        placeholder="IDs de productos (separados por coma)"
                                        className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 flex-1"
                                        rows="3"
                                        value={productHistory}
                                        onChange={(e) => setProductHistory(e.target.value)}
                                    />
                                )}
                                <button
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50"
                                    onClick={handleGetRecommendations}
                                    disabled={loading}
                                >
                                    {loading ? 'Procesando...' : 'Obtener Recomendaciones'}
                                </button>

                                {/* Mostrar recomendaciones */}
                                {recommendations.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-4">Productos Recomendados</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {recommendations.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="bg-gray-800 p-4 rounded-lg"
                                                >
                                                    <h4 className="font-medium">{product.name}</h4>
                                                    <p className="text-gray-400 text-sm mt-1">
                                                        Categoría: {product.category}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;