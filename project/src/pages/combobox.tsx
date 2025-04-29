import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ComboboxItem {
  label: string;
  value: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({ items, value, onChange, placeholder, disabled }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filteredItems = query.length > 0
    ? items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  const selectedItem = items.find(item => item.value === value);

  const handleSelect = (itemValue: string) => {
    onChange(itemValue);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setOpen(prev => !prev)}
        className={`w-full bg-white border ${open ? 'border-green-500' : 'border-gray-300'} rounded-lg px-4 py-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50`}
        disabled={disabled}
      >
        <div className="flex justify-between items-center">
          <span className={`${selectedItem ? '' : 'text-gray-400'}`}>
            {selectedItem ? selectedItem.label : (placeholder || 'Selecionar')}
          </span>
          <ChevronDown className={`h-4 w-4 ml-2 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-2">
              <input
                type="text"
                placeholder="Buscar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <ul className="max-h-60 overflow-y-auto text-sm">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <li
                    key={item.value}
                    onClick={() => handleSelect(item.value)}
                    className="px-4 py-2 hover:bg-green-100 cursor-pointer flex justify-between items-center"
                  >
                    <span>{item.label}</span>
                    {value === item.value && <Check className="h-4 w-4 text-green-600" />}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-400">Nenhum resultado encontrado.</li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
