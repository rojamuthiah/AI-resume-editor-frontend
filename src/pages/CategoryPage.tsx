import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCategories } from "../api/template";

interface Category {
  key: string;
  label: string;
}

const CategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data.categories))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Select Your Career Path</h1>
          <p className="text-lg text-gray-600">Choose a category to find the perfect resume template</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => navigate(`/templates?category=${category.key}`)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition transform hover:scale-105 p-8 border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center min-h-64 cursor-pointer"
            >
              <div className="text-5xl mb-4">
                {category.key === "software_engineering" && "💻"}
                {category.key === "sales_marketing" && "📈"}
                {category.key === "hr_finance" && "👥"}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{category.label}</h2>
              <p className="text-gray-600 text-center mb-4 text-sm">
                {category.key === "software_engineering" && "Find templates tailored for tech professionals"}
                {category.key === "sales_marketing" && "Professional templates for sales and marketing roles"}
                {category.key === "hr_finance" && "Templates designed for HR and Finance professionals"}
              </p>
              <div className="text-blue-600 font-semibold">Explore Templates →</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;