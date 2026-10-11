# JVM Configuration Guide for SafeHer Backend

This document details the JVM (Java Virtual Machine) configuration, memory parameters, and garbage collection tuning applied to the SafeHer Spring Boot service.

---

## 1. Overview

The backend runs on **Java 17 (OpenJDK / Eclipse Temurin)** and Spring Boot 3.2.3. The JVM configuration is optimized for:
- Fast startup and responsive HTTP/REST throughput.
- Predictable low garbage collection pauses using the **G1GC** (Garbage-First Garbage Collector).
- Dynamic container sizing in cloud/Docker environments.
- High reliability with automatic heap dumping upon OutOfMemory errors (`-XX:+HeapDumpOnOutOfMemoryError`).

---

## 2. Configuration Files

| File | Purpose |
| :--- | :--- |
| [`backend/.mvn/jvm.config`](file:///c:/Users/Shalini/OneDrive/Desktop/SafeHer/backend/.mvn/jvm.config) | JVM heap and compilation flags used during Maven build execution. |
| [`backend/jvm.options`](file:///c:/Users/Shalini/OneDrive/Desktop/SafeHer/backend/jvm.options) | Canonical runtime JVM flags for local and production deployment. |
| [`backend/Dockerfile`](file:///c:/Users/Shalini/OneDrive/Desktop/SafeHer/backend/Dockerfile) | Multi-stage container build with container-aware JVM flags. |
| [`backend/run-jvm.bat`](file:///c:/Users/Shalini/OneDrive/Desktop/SafeHer/backend/run-jvm.bat) | Windows launcher script executing with recommended JVM flags. |
| [`backend/run-jvm.sh`](file:///c:/Users/Shalini/OneDrive/Desktop/SafeHer/backend/run-jvm.sh) | Linux/macOS launcher script executing with recommended JVM flags. |

---

## 3. Tuned JVM Parameters

### Heap & Memory Limits
- `-Xms512m`: Initial heap size (allocates 512 MB immediately to avoid early heap resizing).
- `-Xmx2048m`: Maximum heap size (caps memory at 2 GB for standalone runs).
- `-XX:MetaspaceSize=128m` / `-XX:MaxMetaspaceSize=512m`: Reserves memory for class metadata and prevents unbounded metaspace growth.

### Garbage Collector (G1GC)
- `-XX:+UseG1GC`: Enables the Garbage-First collector.
- `-XX:MaxGCPauseMillis=200`: Targets a maximum pause time of 200 ms to maintain low latency for emergency SOS endpoints.
- `-XX:InitiatingHeapOccupancyPercent=45`: Triggers concurrent marking when heap occupancy reaches 45%.

### Container & Cloud Execution
- `-XX:+UseContainerSupport`: Enables automatic detection of cgroup memory and CPU limits.
- `-XX:MaxRAMPercentage=75.0`: In containerized environments, allocates 75% of available RAM to the JVM heap.

### Diagnostics & Recovery
- `-XX:+HeapDumpOnOutOfMemoryError`: Dumps memory state to a `.hprof` file if an `OutOfMemoryError` occurs.
- `-XX:+ExitOnOutOfMemoryError`: Prevents zombie JVM processes if heap exhaustion happens.

---

## 4. How to Run

### Development (Maven)
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.jvmArguments="@jvm.options"
```

### Windows Helper Script
```cmd
cd backend
run-jvm.bat
```

### Linux / macOS Helper Script
```bash
cd backend
chmod +x run-jvm.sh
./run-jvm.sh
```

### Docker Container
```bash
cd backend
docker build -t safeher-backend .
docker run -p 8080:8080 safeher-backend
```
