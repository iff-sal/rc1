import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import BottomNavigationBar from '../../components/BottomNavigationBar';
import { FaSearch, FaMicrophone } from 'react-icons/fa';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

interface Service {
  id: string;
  name: string;
  description: string;
  category?: string;
  department_id: string;
  duration_minutes: number;
}

interface Department {
  id: string;
  name: string;
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchServicesAndDepartments = async () => {
      try {
        const servicesResponse = await api.get('/api/services');
        setServices(servicesResponse.data);
        setFilteredServices(servicesResponse.data); // Initially display all services

        const departmentsResponse = await api.get('/api/departments');
        setDepartments(departmentsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // TODO: Display error message to user
      }
    };
    fetchServicesAndDepartments();
  }, []);

  useEffect(() => {
    let currentServices = services;

    // Apply category filter
    if (selectedCategory) {
      currentServices = currentServices.filter(service => service.category === selectedCategory);
    }

    // Apply search query filter
    if (searchQuery) {
      currentServices = currentServices.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredServices(currentServices);

  }, [searchQuery, selectedCategory, services]);


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category); // Toggle category selection
  };

   // Extract unique categories from services
   const uniqueCategories = Array.from(new Set(services.map(service => service.category).filter(Boolean))) as string[];


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopBar />
      <div className="flex-grow p-4 pb-20"> {/* Add padding-bottom to prevent content overlap with bottom nav */}
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Government Services</h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search services..."
            className="w-full pl-10 pr-10 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <FaMicrophone className="absolute right-3 top-3 text-gray-400" /> {/* Placeholder icon */}
        </div>

        {/* Filter Bubbles (Example hardcoded categories) */}
         <div className="flex overflow-x-auto space-x-2 mb-4 no-scrollbar">
           {['Renewal', 'EPF/ETF', 'Utility', 'Health Services', 'Transport', 'NIC and Documents'].map(category => (
             <button
               key={category}
               className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap
                 ${selectedCategory === category ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}`
               }
               onClick={() => handleCategoryClick(category)}
             >
               {category}
             </button>
           ))}
         </div>


        {/* Service List/Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <Link to={`/services/${service.id}`} key={service.id} className="block">
              <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                <div className="text-xs text-gray-500">
                  Department: {departments.find(dep => dep.id === service.department_id)?.name || 'N/A'}
                </div>
                 <div className="text-xs text-gray-500">
                  Duration: {service.duration_minutes} mins
                </div>
                 {service.category && (
                     <div className="text-xs text-gray-500">
                       Category: {service.category}
                     </div>
                 )}
              </div>
            </Link>
          ))}
          {filteredServices.length === 0 && (
              <div className="text-center text-gray-600 col-span-full">No services found matching your criteria.</div>
          )}
        </div>
      </div>
      <BottomNavigationBar />
    </div>
  );
};

export default ServicesPage;
