import { clsx } from 'clsx';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  className?: string;
}

export function Table({ columns, data, onRowClick }: TableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-[#7BC1B7]">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            onClick={() => onRowClick?.(row)}
            className={clsx(
              'hover:bg-gray-50',
              onRowClick && 'cursor-pointer'
            )}
          >
            {columns.map((column) => (
              <td
                key={column.key}
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
              >
                {column.render
                  ? column.render(row[column.key], row)
                  : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}