###############################################################################
# 1)  BUILD REACT FRONTEND (stage: frontend-build)
###############################################################################
FROM node:20-alpine AS frontend-build

# Set working dir
WORKDIR /app/stackit.client

# Copy React package and lock files
COPY stackit.client/package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the React app
COPY stackit.client ./

# Build React production version
RUN npm run build

###############################################################################
# 2)  BUILD BACKEND .NET (stage: build)
###############################################################################
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# copia il .csproj e ripristina i pacchetti
COPY stackit.client/stackit.client.esproj ./stackit.client/
COPY StackIt.Server/StackIt.Server.csproj ./StackIt.Server/
RUN dotnet restore ./StackIt.Server/StackIt.Server.csproj

# copia tutto il backend
COPY StackIt.Server ./StackIt.Server
COPY stackit.client ./stackit.client

# copia la build React nel wwwroot del backend
COPY --from=frontend-build /app/stackit.client/dist ./StackIt.Server/wwwroot

# Installare Node.js (versione LTS) su immagine Debian-based
RUN apt-get update && apt-get install -y curl gnupg \
 && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y nodejs \
 && node --version && npm --version

# pubblica l'app (Release)
RUN dotnet publish ./StackIt.Server/StackIt.Server.csproj \
      -c Release -o /app/publish

###############################################################################
# 3)  RUNTIME IMAGE (stage: runtime)
###############################################################################
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copia la pubblicazione finale
COPY --from=build /app/publish .

# porta d’ascolto; Render la rileverà e farà da reverse‑proxy su HTTPS
ENV ASPNETCORE_URLS=http://*:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "StackIt.Server.dll"]
