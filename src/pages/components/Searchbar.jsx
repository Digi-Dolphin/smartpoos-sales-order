import { useState, useEffect, useRef } from "react";
import { TextInput } from "flowbite-react";
import { X } from "lucide-react";

// Mock API function - replace with your actual API call
const searchAPI = async (query) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock data - replace with actual API endpoint
  const mockData = [
    "Apple iPhone 14",
    "Samsung Galaxy S23",
    "Google Pixel 7",
    "OnePlus 11",
    "Xiaomi Mi 13",
    "Sony Xperia 1 IV",
    "Huawei P50 Pro",
    "Nothing Phone 1",
    "Motorola Edge 30",
    "Oppo Find X5"
  ];

  // Filter based on query (empty query returns all items)
  if (!query.trim()) {
    return mockData;
  }

  return mockData.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  );
};

export default function Searchbar({ placeholder = "Search...", onSelect, searchFunction, disabled = false }) {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce function to limit API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // API call function
  const performSearch = async (query) => {
    setIsLoading(true);
    setIsOpen(true);

    try {
      // debugger;
      const searchResults = await searchFunction(query);
      console.log(searchResults);
      setResults(searchResults);
    }
    catch (error) {
      console.error("Search API error:", error);
      setResults([]);
    }
    finally {
      setIsLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = debounce(performSearch, 300);

  // Handle input change
  const handleInputChange = (e) => {
    if (disabled) return;

    const value = e.target.value;
    setInputValue(value);
    setHighlightedIndex(-1);
    debouncedSearch(value);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (disabled) return;

    performSearch(inputValue);
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    setInputValue(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onSelect) {
      onSelect(option.value);
    }
  };

  // Handle clear button click
  const handleClear = () => {
    setInputValue("");
    setResults([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (onSelect) {
      onSelect("");
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled || !isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleOptionSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full ">
      <div ref={inputRef} className="relative">
        <TextInput
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="w-full pr-10"
          disabled={disabled}
        />
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-14 cursor-pointer top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Searching...</span>
              </div>
            </div>
          ) : results.length ? (
            results.map((result, index) => (
              <div
                key={index}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${index === highlightedIndex ? "bg-blue-50 text-blue-600" : "text-gray-700"
                  }`}
                onClick={() => handleOptionSelect(result)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {result.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}