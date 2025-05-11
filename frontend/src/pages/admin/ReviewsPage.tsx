import { useState, useEffect } from 'react';
import axios from 'axios';
import { SearchInput } from '../../components/admin/shared/SearchInput';
import { Table } from '../../components/admin/shared/Table';
import { Pagination } from '../../components/admin/shared/Pagination';
import { Star, Trash2 } from 'lucide-react';
import { ConfirmationModal } from '../../components/shared/ConfirmationModal';
import { Layout } from '../../components/admin/AdminLayout';

interface Review {
  id: string;
  doctorName: string;
  department: string;
  rating: number;
  review: string;
  date: string;
}

export function ReviewsPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewData, setReviewData] = useState<Review[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 8;

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transform the data with correct nested path access
      const formattedReviews = response.data.map((review: any) => ({
        id: review._id,
        doctorName: review.doctor_id?.user_id?.name || 'Unknown Doctor',
        department: review.doctor_id?.department_id?.name || 'Unknown Department',
        rating: review.rating || 0,
        review: review.review || '',
        date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown Date',
      }));

      console.log('Formatted reviews:', formattedReviews); // Debug log
      setReviewData(formattedReviews);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    // Add null checks in the filter function
    const filtered = reviewData.filter(review => {
      const searchTerm = search.toLowerCase();
      return (
        (review.doctorName?.toLowerCase() || '').includes(searchTerm) ||
        (review.department?.toLowerCase() || '').includes(searchTerm) ||
        (review.review?.toLowerCase() || '').includes(searchTerm)
      );
    });
    setFilteredReviews(filtered);
    setCurrentPage(1);
  }, [search, reviewData]);

  const handleDeleteClick = (review: Review) => {
    console.log('Selected review for deletion:', review); // Debug log
    setSelectedReview(review);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedReview) {
      try {
        console.log('Attempting to delete review:', selectedReview); // Debug log
        const token = localStorage.getItem('authToken');
        
        await axios.delete(`http://localhost:5000/api/reviews/${selectedReview.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Close modal and clear selection
        setIsDeleteModalOpen(false);
        setSelectedReview(null);
        
        // Show success message
        setSuccessMessage('Review deleted successfully');
        
        // Refresh the reviews list
        await fetchReviews();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } catch (err: any) {
        console.error('Error deleting review:', err);
        setError(err.response?.data?.message || 'Failed to delete review');
        setIsDeleteModalOpen(false);
      }
    }
  };

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);

  const columns = [
    { key: 'doctorName', header: 'Doctor Name' },
    { key: 'department', header: 'Department' },
    {
      key: 'rating',
      header: 'Rating',
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index < value ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      ),
    },
    { key: 'review', header: 'Review' },
    { key: 'date', header: 'Date' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Review) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('Delete button clicked for review:', row);
            handleDeleteClick(row);
          }}
          className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-black">Reviews</h2>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg text-red-600">Error: {error}</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search reviews..."
              />
            </div>

            {filteredReviews.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No reviews found
              </div>
            ) : (
              <>
                <Table
                  columns={columns}
                  data={paginatedReviews}
                  onRowClick={(row) => console.log('Clicked row:', row)}
                />

                <div className="p-4 border-t border-gray-200">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
        )}

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            console.log('Modal closing'); // Debug log
            setIsDeleteModalOpen(false);
          }}
          onConfirm={() => {
            console.log('Confirm delete clicked'); // Debug log
            handleDeleteConfirm();
          }}
          title="Delete Review"
          message="Are you sure you want to delete this review? This action cannot be undone."
          confirmButtonText="Delete Review"
        />
      </div>
    </Layout>
  );
}