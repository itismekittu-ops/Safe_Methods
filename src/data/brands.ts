/** Wordmark styling per institution, echoing each brand's feel in a muted tone. */
export const brandStyles: Record<string, string> = {
  BMO: 'font-sans font-bold tracking-wide',
  RBC: 'font-serif font-semibold tracking-wider',
  TD: 'font-sans font-bold',
  Scotiabank: 'font-sans font-medium',
  CIBC: 'font-sans font-semibold tracking-[0.25em]',
  'National Bank': 'font-serif italic',
  Desjardins: 'font-sans font-medium'
};

export const brandRows = [
['BMO', 'RBC', 'TD', 'Scotiabank', 'CIBC', 'National Bank', 'Desjardins'],
['Desjardins', 'CIBC', 'RBC', 'National Bank', 'BMO', 'Scotiabank', 'TD']];