module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Tailwind CSS가 적용될 파일 경로
  ],
  theme: {
    extend: {
      colors: {
        uosSignatureBlue: '#004094',
        uosBlue: '#005eb8',
        uosBlueLight: '#0077c8',
        uosBlueSoft: '#98cbeb',
        uosBlueMist: '#b9d9eb',
        uosEmerald: '#00b398',
        uosEmeraldLight: '#2cd5c4',
        uosEmeraldSoft: '#9cdbd9',
        uosEmeraldMist: '#dcebec',
        uosGray: '#63666a',
        uosGrayLight: '#bbbcbc',
        uosGraySoft: '#d9d9d6',
        uosGrayMist: '#e7e7e0',
      },
    },
  },
  plugins: [],
}
