import React from 'react';

function App() {
  return (
    <div className="App" style={{ height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="/acronymle.html"
        title="Acronymle"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}

export default App;
