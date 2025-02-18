const RECOMMENDER_BASE_URL = 'https://recommencer3g.onrender.com';
const CLASSIFIER_BASE_URL = 'https://classifier-images.onrender.com';
const SALES_PREDICTION_BASE_URL = 'https://sales-prediction-g5xo.onrender.com';

class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}

const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        throw new ApiError(
            data.detail || 'Error en la petición',
            response.status,
            data
        );
    }

    return data;
};

export const apiService = {
    // Validación y datos iniciales
    async getValidData() {
        try {
            const response = await fetch(`${RECOMMENDER_BASE_URL}/valid-data`);
            return handleResponse(response);
        } catch (error) {
            console.error('Error obteniendo datos válidos:', error);
            throw error;
        }
    },

    // Predicción de ventas
    async predictSales(store, dept, date) {
        try {
            const response = await fetch(`${SALES_PREDICTION_BASE_URL}/predict-sales`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    store: parseInt(store),
                    dept: parseInt(dept),
                    date: date
                })
            });

            return handleResponse(response);
        } catch (error) {
            console.error('Error prediciendo ventas:', error);
            throw error;
        }
    },

    // Clasificación de imágenes
    async classifyImage(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${CLASSIFIER_BASE_URL}/classify-image`, {
                method: 'POST',
                body: formData
            });

            return handleResponse(response);
        } catch (error) {
            console.error('Error clasificando imagen:', error);
            throw error;
        }
    },

    // Recomendaciones
    async getRecommendations(params = {}) {
        try {
            const response = await fetch(`${RECOMMENDER_BASE_URL}/recommend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: params.userId || null,
                    product_history: params.productHistory || null,
                    n_recommendations: params.nRecommendations || 5
                })
            });

            return handleResponse(response);
        } catch (error) {
            console.error('Error obteniendo recomendaciones:', error);
            throw error;
        }
    },

    // Recomendaciones por usuario
    async getRecommendationsByUser(userId, nRecommendations = 5) {
        return this.getRecommendations({
            userId,
            nRecommendations
        });
    },

    // Recomendaciones por historial
    async getRecommendationsByHistory(productHistory, nRecommendations = 5) {
        return this.getRecommendations({
            productHistory,
            nRecommendations
        });
    },

    // Recomendaciones populares
    async getPopularRecommendations(nRecommendations = 5) {
        return this.getRecommendations({
            nRecommendations
        });
    },

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${RECOMMENDER_BASE_URL}/`);
            return handleResponse(response);
        } catch (error) {
            console.error('Error en health check:', error);
            throw error;
        }
    }
};