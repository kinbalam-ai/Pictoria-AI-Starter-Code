import CharacterActions from "./CharacterActions";

const CharacterHeader = () => {
  return (
    <div id="sen0" className="mb-4">
      <div className="flex items-center">
        <ruby className="text-3xl font-bold">
          爱<rt className="text-sm">ài</rt>
        </ruby>
        <span className="text-gray-600 ml-2">(Trad.: 愛)</span>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded">
          HSK 1
        </span>
        <div className="btn-group inline-flex d-print-none px-2">
          <button className="px-1 text-gray-500 hover:text-yellow-500">
            <svg
              className="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 576 512"
            >
              <path d="M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z" />
            </svg>
          </button>
          <button className="px-1 text-gray-500 hover:text-blue-500">
            <svg
              className="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 576 512"
            >
              <path d="M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zm233.32-51.08c-11.17-7.33-26.18-4.24-33.51 6.95-7.34 11.17-4.22 26.18 6.95 33.51 66.27 43.49 105.82 116.6 105.82 195.58 0 78.98-39.55 152.09-105.82 195.58-11.17 7.32-14.29 22.34-6.95 33.5 7.04 10.71 21.93 14.56 33.51 6.95C528.27 439.58 576 351.33 576 256S528.27 72.43 448.35 19.97zM480 256c0-63.53-32.06-121.94-85.77-156.24-11.19-7.14-26.03-3.82-33.12 7.46s-3.78 26.21 7.41 33.36C408.27 165.97 432 209.11 432 256s-23.73 90.03-63.48 115.42c-11.19 7.14-14.5 22.07-7.41 33.36 6.51 10.36 21.12 15.14 33.12 7.46C447.94 377.94 480 319.54 480 256zm-141.77-76.87c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 228.28 336 241.63 336 256c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.86z" />
            </svg>
          </button>
          <button className="px-1 text-gray-500 hover:text-gray-700">
            <svg
              className="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 384 512"
            >
              <path d="M369.941 97.941l-83.882-83.882A48 48 0 0 0 252.118 0H48C21.49 0 0 21.49 0 48v416c0 26.51 21.49 48 48 48h288c26.51 0 48-21.49 48-48V131.882a48 48 0 0 0-14.059-33.941zM332.118 128H256V51.882L332.118 128zM48 464V48h160v104c0 13.255 10.745 24 24 24h104v288H48zm144-76.024c0 10.691-12.926 16.045-20.485 8.485L136 360.486h-28c-6.627 0-12-5.373-12-12v-56c0-6.627 5.373-12 12-12h28l35.515-36.947c7.56-7.56 20.485-2.206 20.485 8.485v135.952zm41.201-47.13c9.051-9.297 9.06-24.133.001-33.439-22.149-22.752 12.235-56.246 34.395-33.481 27.198 27.94 27.212 72.444.001 100.401-21.793 22.386-56.947-10.315-34.397-33.481z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-2">
        <b>Pinyin: </b>
        <a className="text-blue-600 hover:underline" href="#">
          ài
        </a>
      </div>

      <div className="pt-1">
        <b>English Definition: </b>
        <span>
          to love; to be fond of; to like; affection; to be inclined (to do
          sth); to tend to (happen)
        </span>
      </div>

      <div className="pt-1">
        <b>Chinese Definition: </b>
        <br />
        <span>
          ①对人或事有深挚的感情：喜爱。爱慕。爱情。爱戴。爱抚。爱怜。爱恋。爱莫能助(虽同情并愿意帮助，但力量做不到)。友爱。挚爱。仁爱。厚爱。热爱。
          <br />
          ②喜好(hào)：爱好(hào)。爱唱歌。
          <br />
          ③容易：铁爱生锈。
          <br />
          ④重视而加以保护：爱护。爱惜。
        </span>
      </div>

      <div className="pt-1">
        <b>Antonyms:</b>{" "}
        <span className="antonym">
          <a href="#" className="text-blue-600 hover:underline">
            恨
          </a>{" "}
          <a href="#" className="text-blue-600 hover:underline">
            恶
          </a>{" "}
          <a href="#" className="text-blue-600 hover:underline">
            憎
          </a>{" "}
        </span>
      </div>

      <div className="pt-1">
        <b>Total strokes:</b> 10; <b>Radical:</b>{" "}
        <a href="#" className="text-blue-600 hover:underline">
          爪
        </a>
      </div>

      <div className="pt-1">
        <b>Ideographic</b>: To bring a friend{" "}
        <a href="#" className="text-blue-600 hover:underline">
          友
        </a>{" "}
        into one&apos;s house{" "}
        <a href="#" className="text-blue-600 hover:underline">
          冖
        </a>
      </div>

      <div className="pt-1">
        <b>Character Formation:</b>
        <div className="tree">
          <ul className="list-none pl-4">
            <li>
              <span className="text-gray-600">⿱</span>{" "}
              <span className="text-gray-500 text-sm">Above to below</span>
              <ul className="list-none pl-4">
                <li>
                  <span className="text-gray-600">⿱</span>{" "}
                  <span className="text-gray-500 text-sm">Above to below</span>
                  <ul className="list-none pl-4">
                    <li>
                      <a href="#" className="text-blue-600 hover:underline">
                        爫
                      </a>{" "}
                      <span className="text-gray-500">
                        [ <a className="text-blue-600 hover:underline">zhǎo</a>{" "}
                        ]
                      </span>{" "}
                      <span className="text-gray-500 text-sm">
                        claws, nails, talons
                      </span>
                    </li>
                    <li>
                      <a href="#" className="text-blue-600 hover:underline">
                        冖
                      </a>{" "}
                      <span className="text-gray-500">
                        [ <a className="text-blue-600 hover:underline">mì</a> ]
                      </span>{" "}
                      <span className="text-gray-500 text-sm">cover</span>
                    </li>
                  </ul>
                </li>
                <li>
                  <a href="#" className="text-blue-600 hover:underline">
                    友
                  </a>{" "}
                  <span className="text-gray-500">
                    [ <a className="text-blue-600 hover:underline">yǒu</a> ]
                  </span>{" "}
                  <span className="text-gray-500 text-sm">
                    friend, companion; fraternity
                  </span>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <CharacterActions />
    </div>
  );
};

export default CharacterHeader;
