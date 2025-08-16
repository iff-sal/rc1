import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import api from '../../api/axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // Needed for Doughnut chart
} from 'chart.js';
// Removed the backend analytics DTO import as DTOs are redefined below


// Redefine DTOs if not directly accessible
interface FrontendPeakBookingHoursDto {
  hour: number;
  appointmentCount: string; // Backend sends as string from COUNT(*)
}

interface FrontendDepartmentLoadDto {
  departmentName: string;
  departmentId: string;
  appointmentCount: string; // Backend sends as string
}

interface FrontendNoShowRateDto {
  totalConfirmedAppointments: string;
  cancelledByCitizen: string;
  cancelledByOfficer: string;
  noShowRate: number; // Backend calculates as number
}

interface FrontendAverageProcessingTimeDto {
  serviceName: string;
  serviceId: string;
  averageTimeMinutes: number; // Comes from Service entity, likely number
}


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);


const AnalyticsPage: React.FC = () => {
  const [peakHoursData, setPeakHoursData] = useState<FrontendPeakBookingHoursDto[]>([]);
  const [departmentLoadData, setDepartmentLoadData] = useState<FrontendDepartmentLoadDto[]>([]);
  const [noShowRateData, setNoShowRateData] = useState<FrontendNoShowRateDto | null>(null);
  const [avgProcessingTimeData, setAvgProcessingTimeData] = useState<FrontendAverageProcessingTimeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          peakHoursResponse,
          departmentLoadResponse,
          noShowRateResponse,
          avgProcessingTimeResponse,
        ] = await Promise.all([
          api.get('/api/analytics/peak-booking-hours'),
          api.get('/api/analytics/department-load'),
          api.get('/api/analytics/no-show-rates'),
          api.get('/api/analytics/average-processing-times'),
        ]);

        // Assuming response data matches the frontend DTO interfaces
        setPeakHoursData(peakHoursResponse.data);
        setDepartmentLoadData(departmentLoadResponse.data);
        setNoShowRateData(noShowRateResponse.data);
        setAvgProcessingTimeData(avgProcessingTimeResponse.data);

      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);


  // --- Chart Data and Options ---

  // Peak Booking Hours Chart
  const peakHoursChartData = {
    labels: peakHoursData.map(item => `${item.hour}:00`),
    datasets: [
      {
        label: 'Appointments',
        data: peakHoursData.map(item => parseInt(item.appointmentCount, 10)), // Parse count to number
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };
  const peakHoursChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Peak Booking Hours' },
    },
     scales: {
        x: {
           title: {
               display: true,
               text: 'Hour of the Day'
           }
        },
         y: {
           title: {
               display: true,
               text: 'Number of Appointments'
           },
            beginAtZero: true
        }
     }
  };

  // Department Load Chart
  const departmentLoadChartData = {
    labels: departmentLoadData.map(item => item.departmentName),
    datasets: [
      {
        label: 'Appointments',
        data: departmentLoadData.map(item => parseInt(item.appointmentCount, 10)), // Parse count to number
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };
   const departmentLoadChartOptions = {
       responsive: true,
       plugins: {
           legend: { position: 'top' as const },
           title: { display: true, text: 'Department Appointment Load' },
       },
       scales: {
           x: {
               title: {
                   display: true,
                   text: 'Department'
               }
           },
            y: {
               title: {
                   display: true,
                   text: 'Number of Appointments'
               },
               beginAtZero: true
           }
       }
   };

  // No-Show Rate Chart (Doughnut) - Modified to always return valid ChartData structure
   const noShowChartData = noShowRateData ? {
       labels: ['Confirmed (Attended/Completed)', 'Cancelled by Citizen', 'Cancelled by Officer'],
       datasets: [
           {
               data: [
                  parseInt(noShowRateData.totalConfirmedAppointments, 10) - (parseInt(noShowRateData.cancelledByCitizen, 10) + parseInt(noShowRateData.cancelledByOfficer, 10)), // Attended/Completed = Total Confirmed - Total Cancelled
                  parseInt(noShowRateData.cancelledByCitizen, 10),
                  parseInt(noShowRateData.cancelledByOfficer, 10)
                ],
               backgroundColor: [
                   'rgba(75, 192, 192, 0.6)', // Green for attended
                   'rgba(255, 99, 132, 0.6)',  // Red for citizen cancelled
                   'rgba(255, 159, 64, 0.6)',  // Orange for officer cancelled
               ],
               borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
               borderWidth: 1,
           }
       ]
   } : { labels: [], datasets: [] }; // Provides empty arrays when noShowRateData is null

    const noShowChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: `No-Show Rate: ${noShowRateData ? (noShowRateData.noShowRate * 100).toFixed(2) : 'N/A'}%` },
        }
    };


  // Average Processing Time Chart
  const avgProcessingTimeChartData = {
    labels: avgProcessingTimeData.map(item => item.serviceName),
    datasets: [
      {
        label: 'Avg Time (minutes)',
        data: avgProcessingTimeData.map(item => item.averageTimeMinutes),
        backgroundColor: 'rgba(255, 205, 86, 0.6)',
        borderColor: 'rgba(255, 205, 86, 1)',
        borderWidth: 1,
      },
    ],
  };
  const avgProcessingTimeChartOptions = {
       responsive: true,
       plugins: {
           legend: { position: 'top' as const },
           title: { display: true, text: 'Average Service Processing Times' },
       },
        scales: {
           x: {
               title: {
                   display: true,
                   text: 'Service'
               }
           },
            y: {
               title: {
                   display: true,
                   text: 'Average Duration (minutes)'
               },
               beginAtZero: true
           }
       }
   };


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopBar />
      <div className="flex-grow p-4 pb-4"> {/* No bottom nav padding */}
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Analytics Dashboard</h1>

        {loading && <div className="text-center text-gray-600">Loading analytics data...</div>}
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

        {/* Only render charts if not loading and no error */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Booking Hours Chart Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Bar data={peakHoursChartData} options={peakHoursChartOptions} />
            </div>

            {/* Department Load Chart Card */}
             <div className="bg-white p-6 rounded-lg shadow-md">
               <Bar data={departmentLoadChartData} options={departmentLoadChartOptions} />
             </div>

            {/* No-Show Rate Chart Card */}
            {/* Only render this section if noShowRateData is available */}
            {noShowRateData && (
                 <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">No-Show Rate</h2>
                     {/* Use the updated noShowChartData which is guaranteed to have structure */}
                     <div className="relative w-full max-w-[300px]"> {/* Container for Doughnut */}
                        <Doughnut data={noShowChartData} options={noShowChartOptions} />
                     </div>
                     {/* Display raw numbers below */}
                     <div className="text-sm text-gray-700 mt-4">
                         Total Confirmed (incl. cancelled): {noShowRateData.totalConfirmedAppointments} <br/>
                         Cancelled by Citizen: {noShowRateData.cancelledByCitizen} <br/>
                         Cancelled by Officer: {noShowRateData.cancelledByOfficer}
                     </div>
                 </div>
            )}


            {/* Average Processing Time Chart Card */}
             <div className="bg-white p-6 rounded-lg shadow-md">
                <Bar data={avgProcessingTimeChartData} options={avgProcessingTimeChartOptions} />
             </div>

          </div>
        )}

      </div>
      {/* No bottom nav */}
    </div>
  );
};

export default AnalyticsPage;
