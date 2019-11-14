// Pure state selection

export const getCalculationsById = state => state.calculations.byId;

export const getMatches = state => state.calculations.matches;

export const getOrbitals = (state, id) => {
  if (id in state.calculations.orbitalsById) {
    return state.calculations.orbitalsById[id];
  }

  return {}
}

export const error = state => state.calculations.error;

export const getNotebooks = (state, id) => {
  if (id in state.calculations.noteBooksById) {
    return state.calculations.noteBooksById[id];
  }

  return []
}

export const getCalculations = state => Object.values(state.calculations.byId);

export const getMoleculeCalculations = (state, moleculeId) => {
  return getCalculations(state).filter(calculation => calculation.moleculeId === moleculeId);
}

export const getCalculationCreator = state => state.calculations.creator;
