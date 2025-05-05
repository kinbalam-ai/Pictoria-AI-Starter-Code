import SentenceActions from "./SentenceActions";

const ExampleSentences = () => {
  const sentences = [
    {
      id: 1,
      chinese: "我爱妈妈。",
      pinyin: "wǒ ài mā mā",
      english: "I love my mom.",
    },
    {
      id: 2,
      chinese: "我爱你。",
      pinyin: "wǒ ài nǐ",
      english: "I love you.",
    },
    // Add more sentences as needed
  ];

  return (
    <div className="pt-4">
      <h6 className="border-b border-gray-300 pb-2">Example Sentences</h6>
      <table className="w-full">
        <tbody>
          {sentences.map((sentence) => (
            <tr key={sentence.id}>
              <td className="w-5 px-0 py-2">{sentence.id}</td>
              <td className="w-[70px] px-1 py-2">
                <SentenceActions sentenceId={sentence.id} />
              </td>
              <td className="py-2">
                <div className="flex">
                  <div className="samplesen">
                    {sentence.chinese.split("").map((char, i) => (
                      <span key={i} className="cnchar">
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-gray-600">{sentence.english}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* More Sentences */}
      {/* <div className="container mt-4">
          <a
            className="border border-gray-300 hover:bg-gray-100 text-gray-800 py-1 px-3 rounded inline-flex items-center"
            href="#"
            target="_blank"
          >
            More Sentences{' '}
            <svg
              className="w-4 h-4 ml-1"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 512 512"
            >
              <path d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z" />
            </svg>
          </a>
        </div> */}
    </div>
  );
};

export default ExampleSentences;
