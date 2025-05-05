const CharacterAnimation = () => {
  return (
    <div className="ml-auto" id="char_ani_block">
      <div id="char_flash_div" className="charblock">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          id="char_flash_svg"
          width="180"
          height="180"
        >
          {/* SVG content for character animation */}
          <line x1="0" y1="0" x2="180" y2="180" stroke="#DDD"></line>
          <line x1="180" y1="0" x2="0" y2="180" stroke="#DDD"></line>
          <line x1="90" y1="0" x2="90" y2="180" stroke="#DDD"></line>
          <line x1="0" y1="90" x2="180" y2="90" stroke="#DDD"></line>
          <text
            id="char_count"
            x="5"
            y="175"
            style={{ fontSize: "14px", fill: "#999" }}
          ></text>
          {/* More SVG paths would go here */}
        </svg>
      </div>
      <div className="text-center pt-1">
        <button
          id="animate-button"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded text-sm"
        >
          Animate
        </button>
      </div>
    </div>
  );
};

export default CharacterAnimation;
