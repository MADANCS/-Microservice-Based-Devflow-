# DevFlow Local Development Startup Script
# Uses local JDK 21 + pre-built JARs (no Docker required)

$JAVA_EXE = "D:\Java Project\devflow\jdk21\jdk-21.0.2\bin\java.exe"
$ROOT     = "D:\Java Project\devflow"

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "   DevFlow Platform  --  Local Dev Startup                 " -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $JAVA_EXE)) {
    Write-Host "ERROR: Java 21 not found at: $JAVA_EXE" -ForegroundColor Red
    exit 1
}

# Exclusion lists
$kafkaExclude       = "org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
$securityExclude    = "org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration,org.springframework.boot.actuate.autoconfigure.security.servlet.ManagementWebSecurityAutoConfiguration"
$reactiveSecExclude = "org.springframework.boot.autoconfigure.security.reactive.ReactiveSecurityAutoConfiguration,org.springframework.boot.autoconfigure.security.reactive.ReactiveUserDetailsServiceAutoConfiguration,org.springframework.boot.actuate.autoconfigure.security.reactive.ReactiveManagementWebSecurityAutoConfiguration"

# Service definitions: name, port, spring.autoconfigure.exclude
$services = @(
    @{ name = "api-gateway";          port = 9080; exclude = $reactiveSecExclude },
    @{ name = "auth-service";         port = 9081; exclude = $kafkaExclude },
    @{ name = "project-service";      port = 9082; exclude = "$securityExclude,$kafkaExclude" },
    @{ name = "task-service";         port = 9083; exclude = "$securityExclude,$kafkaExclude" },
    @{ name = "ai-engine";            port = 9084; exclude = "$securityExclude,$kafkaExclude" },
    @{ name = "notification-service"; port = 9085; exclude = "$securityExclude,$kafkaExclude" },
    @{ name = "analytics-service";    port = 9086; exclude = "$securityExclude,$kafkaExclude" },
    @{ name = "integration-service";  port = 9087; exclude = "$securityExclude,$kafkaExclude" },
    @{ name = "realtime-service";     port = 9088; exclude = "$securityExclude,$kafkaExclude" }
)

foreach ($svc in $services) {
    $svcPath = Join-Path $ROOT $svc.name
    if (-not (Test-Path $svcPath)) {
        Write-Host "  SKIP: $($svc.name) -- directory not found" -ForegroundColor Yellow
        continue
    }

    $jarFile = Get-ChildItem -Path "$svcPath\target" -Filter "*1.0.0-SNAPSHOT.jar" -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $jarFile) {
        Write-Host "  ERROR: No JAR found for $($svc.name)" -ForegroundColor Red
        continue
    }

    $excludeArg = ""
    if ($svc.exclude) {
        $excludeArg = "--spring.autoconfigure.exclude=$($svc.exclude)"
    }

    $jarPath  = $jarFile.FullName
    $launchCmd = "& '$JAVA_EXE' -jar '$jarPath' $excludeArg"

    Write-Host "  Starting $($svc.name) on :$($svc.port)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '[$($svc.name)]' -ForegroundColor Cyan; cd '$svcPath'; $launchCmd" -WindowStyle Normal
    Start-Sleep -Seconds 4
}

# Start React Frontend
$frontendPath = Join-Path $ROOT "frontend"
if (Test-Path $frontendPath) {
    Write-Host "  Starting React frontend on :4000..." -ForegroundColor Magenta
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal
}

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Green
Write-Host "  All services launched! Wait ~30s for full boot.          " -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Green
Write-Host "  Frontend :  http://localhost:4000                         " -ForegroundColor White
Write-Host "  Gateway  :  http://localhost:9080                         " -ForegroundColor White
Write-Host "  Swagger  :  http://localhost:9081/swagger-ui.html         " -ForegroundColor White
Write-Host "===========================================================" -ForegroundColor Green
