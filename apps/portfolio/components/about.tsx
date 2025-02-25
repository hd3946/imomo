'use client'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import Image from 'next/image'
import { useRef } from 'react'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'

const aboutLink = css`
  color: #0070f3;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
    color: #0056b3;
  }
`

const activitiesText = css`
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  margin: 20px 0;
`

// Create styled components
const StyledDiv = styled.div`
  ${activitiesText}
`

const StyledLink = styled.a`
  ${aboutLink}
`

export function About() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const isVisible = useIntersectionObserver(sectionRef)

  return (
    <section ref={sectionRef} className="p-24" id="about">
      <h2
        className={`text-4xl mb-16 font-bold text-center transition-all duration-1000 transform
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        About Me
      </h2>
      <div className="flex gap-10">
        <div className="relative aspect-square rounded-full border-2 w-36 h-36">
          <Image src="/lama.png" alt="Profile" className="rounded-full object-cover" layout="fill" objectFit="cover" />
        </div>
        <div className="flex flex-col flex-1 space-y-4">
          <p className="text-gray-700 leading-relaxed mb-4">
            I&apos;m a passionate front-end developer specializing in React, TypeScript, and Next.js. I enjoy exploring
            and implementing new technologies, with a particular interest in Web3 and blockchain.
          </p>
          <h2 className="text-2xl font-bold mb-4">Education</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>
              <strong>Bachelor&apos;s Degree</strong> • March 2018 – February 2020 <br />
              Kumo Institute of Technology (4-year program) – Computer Engineering <br />
              <span className="text-sm text-gray-500">Transferred &amp; Graduated Location: Gumi-si, Gyeongnam</span>
            </li>
            <li>
              <strong>Computer Science</strong> • March 2012 – December 2013 <br />
              Daegu University (4-year program) – Computer Engineering <br />
              <span className="text-sm text-gray-500">Discontinued Location: Gyeongsan-si, Gyeongsangbuk</span>
            </li>
            <li>
              <strong>High School</strong> • February 2009 ~ February 2012 <br />
              Seosung High School <br />
              <span className="text-sm text-gray-500">Graduated Location: Daegu</span>
            </li>
          </ul>

          <h2 className="text-2xl font-bold mb-4">Experience</h2>
          <div
            className="flex flex-col gap-2 mt-4 overflow-y-auto max-h-[60vh] pr-4 space-y-8 
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            {/* BPMG - Blockchain Development Team */}
            <div
              className={`bg-gray-100 p-6 rounded-lg shadow-md transition-all duration-500 transform
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <h3 className="text-xl font-bold text-gray-900">BPMG (July 2023 - November 2024)</h3>
              <p className="text-lg text-gray-700 mt-2">Frontend Development</p>
              <ul className="list-disc pl-5 mt-4 text-gray-600">
                <li>Developed services converting RWA-based NFTs from Ethereum to Klaytn network.</li>
                <li>Created Telegram &amp; Discord bots for Web3 wallet connections and role assignments.</li>
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
            <div
              className={`bg-gray-100 p-6 rounded-lg shadow-md transition-all duration-500 transform
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: '400ms' }}
            >
              <h3 className="text-xl font-bold text-gray-900">NDUS Interactive (March 2023 - June 2023)</h3>
              <p className="text-lg text-gray-700 mt-2">Front End Developer</p>
              <ul className="list-disc pl-5 mt-4 text-gray-600">
                <li>Developed a new website and a blockchain-based NFT sales platform.</li>
                <li>Created a game NFT gallery page for showcasing NFTs and game assets.</li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">Technologies: React.js, Next.js, MUI (Material-UI), Web3.js</p>
            </div>

            {/* Factory Automation Program Development */}
            <div
              className={`bg-gray-100 p-6 rounded-lg shadow-md transition-all duration-500 transform
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: '600ms' }}
            >
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
            <div
              className={`bg-gray-100 p-6 rounded-lg shadow-md transition-all duration-500 transform
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: '800ms' }}
            >
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

          <h2 className="text-2xl font-bold">Activities</h2>
          <StyledDiv>
            <p>
              <span className="font-semibold">Participated in Solana Bootcamp 2025:</span> February 5, 2025 ~ February
              20, 2025.
            </p>
            <p>
              <span className="font-semibold">Participated in Web3 Hackathon:</span> May 19, 2023 ~ May 21, 2023
              <StyledLink
                href="https://www.notion.so/imomo/Glitch-Korea-Hackathon-2b09cf67b0c14e82a2d97099acea7c3e?pvs=4"
                className="text-blue-500 ml-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Glitch Korea Hackathon
              </StyledLink>
            </p>
            <p>
              <span className="font-semibold">Graduated from the Blockchain program at CodeStates:</span> July 2022 ~
              December 2022.
            </p>
            <p>
              <span className="font-semibold">Passed the Final Examination:</span> March 2020, Korea Industrial Manpower
              Agency Certification.
            </p>
          </StyledDiv>
        </div>
      </div>
    </section>
  )
}
