import React from 'react';
import { BarChart2, Package, TrendingUp } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="nav">
            <ul className="nav-list">
                <li className="nav-item">
                    <BarChart2 size={20} />
                    <span>Dashboard</span>
                </li>
                <li className="nav-item">
                    <TrendingUp size={20} />
                    <span>Ventas</span>
                </li>
                <li className="nav-item">
                    <Package size={20} />
                    <span>Productos</span>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;