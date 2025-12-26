import React from 'react';

function App() {
  return (
    <div className="App" style={{height: '100vh'}}>
      <iframe
        src="/acronymle.html"
        title="Acronymle"
        style={{width: '100%', height: '100%', border: 'none'}}
      />
      <p style={{textAlign: 'center', marginTop: 8}}>
        If the game doesn't load, open it directly <a href="/acronymle.html" target="_blank" rel="noopener noreferrer">here</a>.
      </p>
    </div>
  );
}

export default App;
