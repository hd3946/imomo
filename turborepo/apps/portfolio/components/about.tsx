export function About() {
  return (
    <section className="p-24" id="about">
      <h2 className="text-3xl font-bold  text-center">About Me</h2>
      <div className="flex py-10 gap-10">
        <div className="relative aspect-square rounded-full border-2 w-36 h-36">
          <img src="/lama.png" alt="Profile" className="rounded-full object-cover" />
        </div>
        <div className="flex flex-col">
          <p className="text-gray-700 leading-relaxed mb-4">
            I'm a passionate front-end developer specializing in React, TypeScript, and Next.js. I thrive on exploring
            and implementing cutting-edge technologies, with a strong focus on the exciting world of Web3 and
            blockchain.
          </p>

          <div className="flex flex-col gap-2 mt-4 space-y-8">
            {/* BPMG - Blockchain Development Team */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900">BPMG (July 2023 - November 2024)</h3>
              <p className="text-lg text-gray-700 mt-2">Frontend Development</p>
              <ul className="list-disc pl-5 mt-4 text-gray-600">
                <li>Developed services converting RWA-based NFTs from Ethereum to Klaytn network.</li>
                <li>Created Telegram & Discord bots for Web3 wallet connections and role assignments.</li>
                <li>Developed features to fetch and display news feeds and real-time coin prices using APIs.</li>
                <li>
                  Implemented a feature to export database information to Excel files, optimizing memory usage by 35%.
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">
                Technologies: React.js, Next.js, Nest.js, MongoDB, Web3.js, Caver.js
              </p>
            </div>

            {/* NDUS Interactive - Front End Developer */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900">NDUS Interactive (March 2023 - June 2023)</h3>
              <p className="text-lg text-gray-700 mt-2">Front End Developer</p>
              <ul className="list-disc pl-5 mt-4 text-gray-600">
                <li>Developed a new website and a blockchain-based NFT sales platform.</li>
                <li>Created a game NFT gallery page for showcasing NFTs and game assets.</li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">Technologies: React.js, Next.js, MUI (Material-UI), Web3.js</p>
            </div>

            {/* Factory Automation Program Development */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900">
                Factory Automation Program Development (July 2021 - March 2022)
              </h3>
              <p className="text-lg text-gray-700 mt-2">Factory Automation</p>
              <ul className="list-disc pl-5 mt-4 text-gray-600">
                <li>
                  Developed PLC code for factory automation systems and established communication with machinery and
                  equipment.
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">Technologies: C++, MSSQL, Winform(DevExpress)</p>
            </div>

            {/* MES & WMS Development for Boiler Factory */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900">
                MES & WMS Development for Factory (August 2020 - January 2021)
              </h3>
              <p className="text-lg text-gray-700 mt-2">MES & WMS Development</p>
              <ul className="list-disc pl-5 mt-4 text-gray-600">
                <li>
                  Implemented Manufacturing Execution System (MES) and Warehouse Management System (WMS) for production
                  and inventory optimization at a boiler factory.
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">Technologies: C#, MSSQL, Winform, WPF</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
