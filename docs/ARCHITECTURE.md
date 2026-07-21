# Architecture notes

#

# State:

# - React Query: server/chain reads, caching, background refetch

# - Redux: cross-route UI + portfolio/markets client state

# - Context: thin theme/session providers only

#

# Features:

# - Put domain logic under src/features/<domain>/

# - Keep pages thin — compose feature components

# - Keep ABIs and chain config in src/lib/web3/
