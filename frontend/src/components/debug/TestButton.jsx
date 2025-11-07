import React from 'react';

const TestButton = () => {
  const handleClick = () => {
    console.log('🎯 TEST BUTTON CLICKED - This should appear in console');
    alert('Test button worked! Check console for message.');
  };

  return (
    <div className="fixed top-20 right-6 z-50 p-4 bg-red-500 text-white rounded-lg">
      <button 
        onClick={handleClick}
        className="px-4 py-2 bg-red-600 rounded"
      >
        Test Click
      </button>
      <p className="text-sm mt-2">Click me first</p>
    </div>
  );
};

export default TestButton;