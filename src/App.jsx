import React, { useState, useEffect } from 'react';
import {
    BarChart2,
    Image,
    ShoppingBag,
    TrendingUp,
    Users,
    Package
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { apiService } from './services/apiService';

function App() {
    // Tab states
    const [activeTab, setActiveTab] = useState('sales');
    const [recommendationTab, setRecommendationTab] = useState('user');

    // Valid data for stores, departments and date range
    const [validData, setValidData] = useState(null);

    // Sales prediction states
    const [selectedStore, setSelectedStore] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [salesPrediction, setSalesPrediction] = useState(null);
    const [salesChartData, setSalesChartData] = useState([]);

    // Recommendations states
    const [userId, setUserId] = useState('');
    const [productHistory, setProductHistory] = useState('');
    const [recommendations, setRecommendations] = useState([]);

    // Classification state
    const [classificationResult, setClassificationResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [classificationLoading, setClassificationLoading] = useState(false);

    // General states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load valid data on mount
    useEffect(() => {
        const loadValidData = async () => {
            try {
                // Define valid store numbers (1 to 45)
                const validStores = Array.from({ length: 45 }, (_, i) => i + 1);
                // Define valid department IDs
                const validDepartments = [
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19,
                    20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
                    36, 37, 38, 40, 41, 42, 44, 45, 46, 47, 48, 49, 51, 52, 54, 55,
                    56, 58, 59, 60, 67, 71, 72, 74, 77, 78, 79, 80, 81, 82, 83, 85,
                    87, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 39, 50, 43, 65
                ];
                // Define date range
                const dateRange = {
                    min_date: '2010-02-05',
                    max_date: '2013-07-26'
                };

                setValidData({
                    valid_stores: validStores,
                    valid_departments: validDepartments,
                    date_range: dateRange
                });
            } catch (err) {
                setError('Error cargando datos iniciales');
                console.error('Error:', err);
            }
        };

        loadValidData();
    }, []);

    // Manejador para predicción de ventas con generación aleatoria y delay de 10 segundos
    const handlePredictSales = async () => {
        if (!selectedStore || !selectedDept || !selectedDate) {
            setError('Por favor completa todos los campos');
            return;
        }
        setLoading(true);
        setError(null);

        // Delay de 10 segundos
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Generar valores aleatorios similares al ejemplo
        const basePrediction = Math.random() * (45000 - 40000) + 40000; // entre 40000 y 45000
        const dayOfWeekFactor = 1; // valor fijo
        const monthFactor = Math.random() * (1.05 - 1.0) + 1.0; // entre 1.0 y 1.05
        const recentTrend = Math.random() * (48000 - 45000) + 45000; // entre 45000 y 48000
        const adjustedPrediction = basePrediction * monthFactor;
        // Calcular la predicción final como promedio de las tres predicciones
        const predictedSales = (basePrediction + adjustedPrediction + recentTrend) / 3;
        // Definir límites de confianza
        const lowerBound = predictedSales * 0.95;
        const upperBound = predictedSales * 1.1;

        const prediction = {
            store: Number(selectedStore),
            department: Number(selectedDept),
            date: selectedDate,
            predicted_sales: predictedSales,
            details: {
                base_prediction: basePrediction,
                day_of_week_factor: dayOfWeekFactor,
                month_factor: monthFactor,
                recent_trend: recentTrend,
                adjusted_prediction: adjustedPrediction,
                bounds: {
                    lower: lowerBound,
                    upper: upperBound
                }
            }
        };

        setSalesPrediction(prediction);

        // Actualizar datos del gráfico
        setSalesChartData([
            { name: 'Predicción Base', ventas: prediction.details.base_prediction },
            { name: 'Predicción Ajustada', ventas: prediction.details.adjusted_prediction },
            { name: 'Predicción Final', ventas: prediction.predicted_sales }
        ]);

        setLoading(false);
    };

    // Manejador para clasificación de imágenes (al hacer clic en el botón)
    const handleClassifyImage = async () => {
        if (!selectedFile) return;
        setClassificationLoading(true);
        setError(null);
        setClassificationResult(null);

        try {
            const result = await apiService.classifyImage(selectedFile);
            setClassificationResult(result);
        } catch (err) {
            setError('Error al clasificar la imagen');
            console.error('Error:', err);
        } finally {
            setClassificationLoading(false);
        }
    };

    // Manejador para recomendaciones utilizando valores random del CSV con delay de 10 segundos
    const handleGetRecommendations = async () => {
        setLoading(true);
        setError(null);

        // Delay de 10 segundos
        await new Promise(resolve => setTimeout(resolve, 10000));

        try {
            // Cargar el archivo CSV desde la carpeta public
            const response = await fetch('/nombres.csv');
            if (!response.ok) {
                throw new Error('Error al cargar el archivo CSV');
            }
            const csvText = await response.text();

            // Separar las líneas y remover posibles líneas vacías
            const lines = csvText.split('\n').filter(line => line.trim() !== '');

            // La primera línea debe ser el header
            const header = lines[0].split(',').map(h => h.trim());
            const nameIndex = header.indexOf('name');
            if (nameIndex === -1) {
                throw new Error("La columna 'name' no se encontró en el CSV");
            }

            // Procesar cada línea para extraer el valor de la columna "name"
            const items = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                return { name: values[nameIndex] };
            });

            // Seleccionar aleatoriamente, por ejemplo, 5 recomendaciones
            const shuffled = items.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 5).map((item, index) => ({
                id: index, // Puedes generar un id único según tus necesidades
                ...item
            }));

            setRecommendations(selected);
        } catch (err) {
            setError('Error al obtener recomendaciones desde CSV');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Mostrar un fallback mientras se cargan los datos válidos
    if (!validData) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-900 text-gray-100">
                <p>Cargando datos iniciales...</p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-900 text-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-gray-800 p-4 border-b border-gray-700">
                <h1 className="text-2xl font-bold">Ecommerce Intelligence</h1>
            </header>

            {/* Navigation */}
            <nav className="bg-gray-800 p-3 border-b border-gray-700" role="navigation">
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

            {/* Error display */}
            {error && (
                <div className="bg-red-500 text-white p-2 text-center">
                    {error}
                </div>
            )}

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <div className="p-4 h-full">
                    {/* Sales Prediction Tab */}
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
                                                ${salesPrediction?.details?.base_prediction?.toFixed(2) || '0.00'}
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
                                                ${salesPrediction?.details?.adjusted_prediction?.toFixed(2) || '0.00'}
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
                                                ${salesPrediction?.predicted_sales?.toFixed(2) || '0.00'}
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
                                    aria-label="Selecciona una tienda"
                                >
                                    <option value="">Selecciona una tienda</option>
                                    {validData.valid_stores.map((store) => (
                                        <option key={store} value={store}>
                                            Tienda {store}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 min-w-[200px]"
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    aria-label="Selecciona un departamento"
                                >
                                    <option value="">Selecciona un departamento</option>
                                    {validData.valid_departments.map((dept) => (
                                        <option key={dept} value={dept}>
                                            Departamento {dept}
                                        </option>
                                    ))}
                                </select>

                                {/* Se elimina min y max del input de fecha */}
                                <input
                                    type="date"
                                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    aria-label="Selecciona una fecha"
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

                    {/* Classification Tab */}
                    {activeTab === 'classification' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Clasificación de Productos</h2>
                            <div className="bg-gray-800 rounded-lg p-8">
                                {/* Área para seleccionar la imagen */}
                                <div
                                    className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center cursor-pointer"
                                    onClick={() =>
                                        document.getElementById('image-upload')?.click()
                                    }
                                    role="button"
                                    aria-label="Seleccionar imagen para clasificación"
                                >
                                    <Image className="mx-auto text-gray-500 mb-4" size={48} />
                                    <p className="text-gray-400 mb-4">
                                        Arrastra una imagen o haz click para seleccionar
                                    </p>
                                    <input
                                        type="file"
                                        id="image-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            setSelectedFile(e.target.files[0]);
                                            setClassificationResult(null);
                                        }}
                                    />
                                </div>

                                {/* Botón para iniciar la clasificación si hay una imagen seleccionada */}
                                {selectedFile && (
                                    <button
                                        onClick={handleClassifyImage}
                                        disabled={classificationLoading}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {classificationLoading ? 'Clasificando...' : 'Clasificar imagen'}
                                    </button>
                                )}

                                {classificationResult && (
                                    <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-2">Resultado:</h3>
                                        <p>Clase: {classificationResult.prediction}</p>
                                        <p>
                                            Confianza:{' '}
                                            {(classificationResult.confidence * 100).toFixed(2)}%
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recommendations Tab */}
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

                                {recommendations.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-4">
                                            Productos Recomendados
                                        </h3>
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
