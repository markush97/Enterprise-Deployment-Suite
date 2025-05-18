export function CustomerSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded mr-3"></div>
          <div>
            <div className="h-4 w-40 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-28 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded ml-auto"></div>
      </td>
    </tr>
  );
}

export function CustomerListSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, index) => (
        <CustomerSkeleton key={index} />
      ))}
    </>
  );
}
