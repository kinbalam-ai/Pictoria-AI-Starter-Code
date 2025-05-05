const ExampleWords = () => {
    const exampleWords = [
      {
        word: "爱情",
        pinyin: "ài qíng",
        definition: "romance; love (romantic)",
        hsk: "HSK 4"
      },
      {
        word: "爱国",
        pinyin: "ài guó",
        definition: "to love one's country; patriotic",
        hsk: ""
      }
      // Add more words as needed
    ];
  
    return (
      <div className="pt-4">
        <h6 className="border-b border-gray-300 pb-2">Example Words</h6>
        <table className="w-full mb-0">
          <tbody>
            {exampleWords.map((word, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="min-w-[80px] py-2">
                  <a className="text-blue-600 hover:underline" href="#">
                    {word.word}
                  </a>
                </td>
                <td className="min-w-[100px] py-2">
                  {word.pinyin.split(' ').map((py, i) => (
                    <a key={i} className="text-blue-600 hover:underline" href="#">
                      {py}
                    </a>
                  ))}
                </td>
                <td className="py-2">{word.definition}</td>
                <td className="py-2 align-middle">
                  {word.hsk && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded">
                      {word.hsk}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* <div className="d-print-none">
          <b>More: </b>
          <a href="#" className="text-blue-600 hover:underline mr-1">
            爱*
          </a>{' '}
          |{' '}
          <a href="#" className="text-blue-600 hover:underline mr-1">
            *爱
          </a>{' '}
          |{' '}
          <a href="#" className="text-blue-600 hover:underline">
            *爱*
          </a>
        </div> */}
      </div>
    );
  };
  
  export default ExampleWords;