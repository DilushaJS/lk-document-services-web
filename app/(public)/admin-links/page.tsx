export default function AdminLinks() {
  const services = [
    { label: "Business Formation", href: "/business-formation" },
    { label: "Immigration", href: "/immigration" },
    { label: "Notary", href: "/notary" },
    { label: "Rent/Lease", href: "/rent-lease" },
    { label: "Sri Lankan Documents", href: "/sri-lankan-documents" },
    { label: "Trademark", href: "/trademark" },
  ];

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans">
      <div className="flex flex-1 w-full max-w-5xl mx-auto flex-col items-center py-16 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            LK Document Services
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Access our forms and services below
          </p>
        </div>

        {/* Admin Dashboard Link */}
        <div className="w-full mb-12">
          <a
            href="/admin-login"
            className="block w-full md:w-96 mx-auto px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-center transition-colors"
          >
            → Admin Dashboard
          </a>
        </div>

        {/* Services Section */}
        <div className="w-full mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Services & Forms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <a
                key={service.href}
                href={service.href}
                className="px-6 py-4 bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg hover:shadow-lg hover:border-indigo-400 dark:hover:border-indigo-500 transition-all text-gray-900 dark:text-white font-medium"
              >
                {service.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
