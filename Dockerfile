FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/FloriculturaEmbeleze/FloriculturaEmbeleze.API/FloriculturaEmbeleze.API.csproj backend/FloriculturaEmbeleze/FloriculturaEmbeleze.API/
COPY backend/FloriculturaEmbeleze/FloriculturaEmbeleze.Application/FloriculturaEmbeleze.Application.csproj backend/FloriculturaEmbeleze/FloriculturaEmbeleze.Application/
COPY backend/FloriculturaEmbeleze/FloriculturaEmbeleze.Domain/FloriculturaEmbeleze.Domain.csproj backend/FloriculturaEmbeleze/FloriculturaEmbeleze.Domain/
COPY backend/FloriculturaEmbeleze/FloriculturaEmbeleze.Infrastructure/FloriculturaEmbeleze.Infrastructure.csproj backend/FloriculturaEmbeleze/FloriculturaEmbeleze.Infrastructure/
RUN dotnet restore backend/FloriculturaEmbeleze/FloriculturaEmbeleze.API/FloriculturaEmbeleze.API.csproj

COPY backend/FloriculturaEmbeleze/ backend/FloriculturaEmbeleze/
RUN dotnet publish backend/FloriculturaEmbeleze/FloriculturaEmbeleze.API/FloriculturaEmbeleze.API.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "FloriculturaEmbeleze.API.dll"]
