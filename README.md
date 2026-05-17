# DrumTune

![Tests](https://github.com/sbstn-jmnz/tune-drums/actions/workflows/test.yml/badge.svg)

Web drum tuner.

Built with Vue 3 + Web Audio API.

## Features

- Real-time drum pitch detection
- Fundamental frequency estimation
- Median smoothing
- Attack detection
- Pitch lock stabilization
- Rejection decay
- Drum tuning presets
- Responsive UI
- Unit tests with Vitest

## Tech Stack

- Vue 3
- Vite
- Web Audio API
- Vitest

## Getting Started

### Install

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

### Run tests

```bash
npm test
```

## Project Structure

```txt
src/
├── components/
├── composables/
├── services/
├── utils/
└── styles/
```

## Drum Tuning Workflow

1. Mute opposite drum head
2. Tap near one lug
3. Match all lug frequencies
4. Check center pitch
5. Save preset

## Roadmap

- [ ] FFT spectral view
- [ ] Saved custom presets
- [ ] Mobile optimization
- [ ] WASM pitch detection
- [ ] Recording/export
- [ ] Harmonic suppression

## License

MIT