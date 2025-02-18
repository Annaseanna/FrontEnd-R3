import React from 'react';
import { BarChart2, DollarSign, Package, Users } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="dashboard">
            <div className="stats-grid">
                <div className="stat-card">
                    <DollarSign size={24} />
                    <div className="stat-content">
                        <h3>Ventas Totales</h3>
                        <p className="stat-value">$45,231</p>
                        <p className="stat-change">+12.5% vs último mes</p>
                    </div>
                </div>

                <div className="stat-card">
                    <Users size={24} />
                    <div className="stat-content">
                        <h3>Clientes Activos</h3>
                        <p className="stat-value">1,234</p>
                        <p className="stat-change">+3.2% vs último mes</p>
                    </div>
                </div>

                <div className="stat-card">
                    <Package size={24} />
                    <div className="stat-content">
                        <h3>Productos</h3>
                        <p className="stat-value">342</p>
                        <p className="stat-change">5 nuevos productos</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;