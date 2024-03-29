cmake_minimum_required(VERSION 2.8)
project(tw-c-sdk)
include(CMakeDependentOption)

#
# Option Configuration
#
option(INCLUDE_DOTNET_WRAPPER "INCLUDE_DOTNET_WRAPPER" false)
option(COLLECT_COVERAGE "Set to collect code coverage" false)
option(USE_GRAFANA "Set to send performance test data to grafana" OFF)
option(USE_HTML_GRAPHING "Record performance test data to local javascript files." OFF)
option(BUILD_DEBUG "Set CMAKE_BUILD_TYPE to Debug or Release" OFF)
option(USE_AXTLS "Set to use the axtls tls library" OFF)
option(USE_OPENSSL "Set to use the openssl tls library" ON)
option(ENABLE_TUNNELING "Set to compile SDK with tunneling feature" ON)
option(ENABLE_FILE_XFER "Set to compile SDK with file xfer feature" ON)
option(ENABLE_OFFLINE_MSG_STORE_RAM "Set to compile SDK with RAM offline msg store feature" OFF)
option(ENABLE_OFFLINE_MSG_STORE_FILE "Set to compile SDK with file offline msg store feature" OFF)
option(ENABLE_FIPS_MODE "Set to enable FIPS mode using the openssl tls library" OFF)
option(ENABLE_C_89_WARNINGS "Set to enable extensive warnings for c89 compliance." OFF)
option(IGNORE_UNSTABLE_TESTS "Set CI build params, ignore problematic tests" ON)
option(RELEASE "Exclude regression test target for release builds" ON)
option(BUILD_AND_INSTALL_SHARED "Build, install and package shared library" ON)

# Enforce mutually exclusive TLS library options
if (USE_AXTLS AND USE_OPENSSL)
    message(FATAL_ERROR "ERROR: Select at most one tls library")
    elseif (NOT USE_AXTLS AND NOT USE_OPENSSL )
set(TLS_LIB "notls")
    message(WARNING "WARNING: No tls library selected, configuring without tls")
    elseif (USE_AXTLS )
set(TLS_LIB "axtls")
    elseif (USE_OPENSSL)
    set(TLS_LIB "openssl" )
endif ()

# Enforce mutually exclusive offline msg store options
if (ENABLE_OFFLINE_MSG_STORE_RAM AND ENABLE_OFFLINE_MSG_STORE_FILE )
    message(FATAL_ERROR "ERROR: Select at most one offline msg store configuration")
endif()
# Enforce that FIPS mode can only be enabled with the openssl tls library selected
if ( ENABLE_FIPS_MODE AND NOT USE_OPENSSL )
    message(FATAL_ERROR "ERROR: FIPS mode can only be enabled with the openssl tls library selected")
endif()

# set CMAKE_BUILD_TYPE
if (BUILD_DEBUG)
	add_definitions( -Wall)
  if (NOT ${CMAKE_SYSTEM_NAME} MATCHES "Windows")
    add_definitions( -Wno-unused-function)
  endif ()
	set(CMAKE_BUILD_TYPE "Debug")
else()
	add_definitions( -w)
	set(CMAKE_BUILD_TYPE "Release")
endif()

#
# Platform configuration
#
if (PLATFORM)
	MESSAGE(STATUS "Using GCC cross-compiler toolchain")
	set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM ONLY)
	set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
	set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
	if (${PLATFORM} MATCHES "linux-arm-hwfpu")
		set(OS "linux")
		set(ARCHITECTURE "arm-hwfpu")
		set(CMAKE_FIND_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR}/../TOOLS/gcc-linux-arm-hwfpu-cross/arm-unknown-linux-gnueabi)
		set(CMAKE_C_COMPILER ${CMAKE_CURRENT_SOURCE_DIR}/../TOOLS/gcc-linux-arm-hwfpu-cross/bin/arm-unknown-linux-gnueabi-gcc)
        elseif (${PLATFORM} MATCH "aarch64")
                set(OS "linux")
                set(ARCHITECTURE "arm-aarch64")
                set(CMAKE_FIND_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR}/../TOOLS/gcc-linux-arm-aarch64-cross/arm-unknown-linux-gnueabi)
                set(CMAKE_C_COMPILER ${CMAKE_CURRENT_SOURCE_DIR}/../TOOLS/gcc-linux-arm-aarch64-cross/bin/arm-unknown-linux-gnueabi-gcc)
	elseif (${PLATFORM} MATCHES "linux-arm")
		set(OS "linux")
		set(ARCHITECTURE "arm")
		set(CMAKE_C_COMPILER ${CMAKE_CURRENT_SOURCE_DIR}/../TOOLS/gcc-linux-arm-cross/bin/arm-angstrom-linux-gnueabi-gcc)
		set(CMAKE_FIND_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR}/../TOOLS/gcc-linux-arm-cross ${CMAKE_CURRENT_SOURCE_DIR}/../TOOLS/gcc-linux-arm-cross/arm-angstrom-linux-gnueabi)
		# Set LD_LIBRARY_PATH
		set(Env{LD_LIBRARY_PATH} "${CMAKE_FIND_ROOT_PATH}/lib/gcc")
	elseif (${PLATFORM} MATCHES "linux-coldfire")
		set(OS "linux")
		set(ARCHITECTURE "m68k")
		set(CMAKE_FIND_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR}/../TOOLS/gcc-linux-coldfire-cross/m68k-linux-gnu)
		set(CMAKE_C_COMPILER ${CMAKE_CURRENT_SOURCE_DIR}/../TOOLS/gcc-linux-coldfire-cross/bin/m68k-linux-gnu-gcc)
	elseif (${PLATFORM} MATCHES "linux-x86-32")
		set(OS "linux")
		set(ARCHITECTURE "x86_32")
		set(CMAKE_FIND_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR}/../TOOLS/gcc-linux-x86-32-cross/i486-nptl-linux-gnu)
		set(CMAKE_C_COMPILER ${CMAKE_CURRENT_SOURCE_DIR}/../TOOLS/gcc-linux-x86-32-cross/bin/i486-nptl-linux-gnu-gcc)
	elseif (${PLATFORM} MATCHES "linux-x86-64")
		set(OS "linux")
		set(ARCHITECTURE "x86_64")
		set(CMAKE_FIND_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR}/../TOOLS/gcc-linux-x86-64-cross/x86_64-unknown-linux-gnu)
		set(CMAKE_C_COMPILER ${CMAKE_CURRENT_SOURCE_DIR}/../TOOLS/gcc-linux-x86-64-cross/bin/x86_64-unknown-linux-gnu-gcc)
	elseif (${PLATFORM} MATCHES "macos32")
		set(OS "macos")
		set(ARCHITECTURE "x86_32")
	elseif (${PLATFORM} MATCHES "macos64")
		set(OS "macos")
		set(ARCHITECTURE "x86_64")
	elseif (${PLATFORM} MATCHES "win32")
		set(OS "windows")
		set(ARCHITECTURE "x86_32")
	elseif (${PLATFORM} MATCHES "win64")
		set(OS "windows")
		set(ARCHITECTURE "x86_64")
	else ()
		message(FATAL_ERROR "Invalid cross-compiler platform type specified: " ${PLATFORM})
	endif ()
else ()
	MESSAGE(STATUS "Dynamically determining native platform")
	if (${CMAKE_SYSTEM_NAME} MATCHES "Linux")
		set(OS "linux")
		if (${CMAKE_SYSTEM_PROCESSOR} MATCHES "x86_64" OR ${CMAKE_SYSTEM_PROCESSOR} MATCHES "AMD64")
			set(ARCHITECTURE "x86_64")
			set(PLATFORM "linux-x86-64")
		elseif (${CMAKE_SYSTEM_PROCESSOR} MATCHES "x86_32" OR ${CMAKE_SYSTEM_PROCESSOR} MATCHES "i[36]86")
			set(ARCHITECTURE "x86_32")
			set(PLATFORM "linux-x86-32")
		elseif (${CMAKE_SYSTEM_PROCESSOR} MATCHES "armv5tejl")
			set(ARCHITECTURE "arm")
			set(PLATFORM "linux-arm")
		elseif (${CMAKE_SYSTEM_PROCESSOR} MATCHES "armv[67]l")
			set(ARCHITECTURE "arm-hwfpu")
			set(PLATFORM "linux-arm-hwfpu")
                elseif (${CMAKE_SYSTEM_PROCESSOR} MATCHES "aarch64")
                        set(ARCHITECTURE "arm-aarch64")
                        set(PLATFORM "linux-arm-aarch64")
		else () # default to linux-x86_64
			set(ARCHITECTURE "x86_64")
			set(PLATFORM "linux-x86-64")
		endif()
	elseif (${CMAKE_SYSTEM_NAME} MATCHES "Windows")
		set(OS "windows")
		# On Windows, rely on the generator for the build bitness
		if(${CMAKE_GENERATOR} MATCHES "Win64")
			set(ARCHITECTURE "x86_64")
			set(PLATFORM "win64")
		else()
			set(ARCHITECTURE "x86_32")
			set(PLATFORM "win32")
		endif()
	elseif (${CMAKE_SYSTEM_NAME} MATCHES "Darwin")
		set(OS "macos")
		if (${CMAKE_SYSTEM_PROCESSOR} MATCHES "x86_64" OR ${CMAKE_SYSTEM_PROCESSOR} MATCHES "AMD64")
			set(ARCHITECTURE "x86_64")
			set(PLATFORM "macos64")
		elseif (${CMAKE_SYSTEM_PROCESSOR} MATCHES "x86_32" OR ${CMAKE_SYSTEM_PROCESSOR} MATCHES "i[36]86")
			set(ARCHITECTURE "x86_32")
			set(PLATFORM "macos32")
		else () # default to macos64
			set(ARCHITECTURE "x86_64")
			set(PLATFORM "macos64")
		endif ()
	endif ()
endif ()

#If running the SDK test we set the rpath to the immediate directory via $ORIGIN
#This makes sure the correct openssl libraries are pulled in during testing
if(BUILD_DEBUG)
	if(${OS} MATCHES "linux")
		set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -Wl,-rpath,'$ORIGIN'")
	endif()
endif()

# Get version from version.properties file
file(READ "${CMAKE_SOURCE_DIR}/version.properties" contents)
string(REGEX REPLACE ".*version.major=([0-9]+).*" "\\1" SDK_PRODUCT_MAJOR ${contents})
string(REGEX REPLACE ".*version.minor=([0-9]+).*" "\\1" SDK_PRODUCT_MINOR ${contents})
string(REGEX REPLACE ".*version.revision=([0-9]+).*" "\\1" SDK_PRODUCT_REV ${contents})
if (BUILD_NUMBER)
	set(C_SDK_VERSION "${SDK_PRODUCT_MAJOR}.${SDK_PRODUCT_MINOR}.${SDK_PRODUCT_REV}.${BUILD_NUMBER}")
else ()
	set(C_SDK_VERSION "${SDK_PRODUCT_MAJOR}.${SDK_PRODUCT_MINOR}.${SDK_PRODUCT_REV}")
endif ()
add_definitions(-DC_SDK_VERSION="${C_SDK_VERSION}")

message(STATUS "#### Build Configuration ####")
message(STATUS "VERSION: " ${C_SDK_VERSION})
message(STATUS "DEBUGGING SUPPORT: " ${BUILD_DEBUG})
message(STATUS "PLATFORM: " ${PLATFORM})
message(STATUS "ARCHITECTURE: " ${ARCHITECTURE})
message(STATUS "TLS_LIB: " ${TLS_LIB})
message(STATUS "ENABLE_TUNNELING: " ${ENABLE_TUNNELING})
message(STATUS "ENABLE_FILE_XFER: " ${ENABLE_FILE_XFER})
message(STATUS "ENABLE_OFFLINE_MSG_STORE_RAM: " ${ENABLE_OFFLINE_MSG_STORE_RAM})
message(STATUS "ENABLE_OFFLINE_MSG_STORE_FILE: " ${ENABLE_OFFLINE_MSG_STORE_FILE})
message(STATUS "COLLECT_COVERAGE: " ${COLLECT_COVERAGE})
message(STATUS "USE_GRAFANA: " ${USE_GRAFANA})
message(STATUS "USE_HTML_GRAPHING: " ${USE_HTML_GRAPHING})
message(STATUS "#### CMake System Variables ####")
message(STATUS "CMAKE_SYSTEM_NAME: " ${CMAKE_SYSTEM_NAME})
message(STATUS "CMAKE_SYSTEM_PROCESSOR: " ${CMAKE_SYSTEM_PROCESSOR})
message(STATUS "Build & Install Shared Library: " ${BUILD_AND_INSTALL_SHARED})
if (ENABLE_C_89_WARNINGS)
	# Enforce C89 Compliance
	add_definitions(-pedantic -ansi -Wno-long-long)
endif()

#
# Code coverage configuration
#
if (COLLECT_COVERAGE)
	message(STATUS "Configuring code coverage")
	add_definitions(-O0 -ftest-coverage -fprofile-arcs)
	set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -coverage" CACHE INTERNAL "" FORCE)
	link_libraries(gcov)
endif ()

#
# Grafana configuration
#
if ("${USE_GRAFANA}" STREQUAL "ON")
	add_definitions(-DUSE_GRAFANA)
endif ()

if ("${USE_HTML_GRAPHING}" STREQUAL "ON")
    add_definitions(-DUSE_HTML_GRAPHING)
endif ()

#
# TLS library configuration
#
if (${TLS_LIB} MATCHES "axtls")
	# Configure axtls
	add_definitions(-DTW_TLS_INCLUDE="twAxTls.h")
	if (${OS} MATCHES "linux")
		add_definitions(-DTW_OS_INCLUDE="twLinux.h")
	elseif(${OS} MATCHES "windows")
		add_definitions(-DTW_OS_INCLUDE="twWindows.h")
		add_definitions(-DWIN32)
	else()
		add_definitions(-DTW_OS_INCLUDE="twLinux.h")
	endif ()
elseif (${TLS_LIB} MATCHES "openssl")
	# ##########################################################################
	# Configure openssl
	# Note: User can specify the following environment variables to (optionally)
	# externally source the include, library, and (on Windows) binary paths to
	# the preferred OpenSSL implementation:
	#
	# 	THINGWORX_CSDK_OPENSSL_INCLUDE_DIR=<openssl-version>/include
	# 	THINGWORX_CSDK_OPENSSL_LIB_DIR=<openssl-version>/lib
	# 	THINGWORX_CSDK_OPENSSL_BIN_DIR=<openssl-version>/bin
	#
	# ##########################################################################
	add_definitions(-DTW_TLS_INCLUDE="twOpenSSL.h")
	if (${OS} MATCHES "linux")
		add_definitions(-DTW_OS_INCLUDE="twLinux-openssl.h")
	elseif (${OS} MATCHES "windows")
		add_definitions(-DTW_OS_INCLUDE="twWindows-openssl.h")
	elseif(${OS} STREQUAL "macos")
		add_definitions(-DTW_OS_INCLUDE="twLinux-openssl.h")
	endif ()

	# Configure a platform independent OpenSSL root directory
	set(OPENSSL_INTERNAL_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/src/thirdParty/openssl-1.0.2l_fips-2.0.16")

	# Configure the platform-dependent OpenSSL directory
	if (${PLATFORM} MATCHES "linux-x86-64")
		set(OPENSSL_PLATFORM_DIR ${OPENSSL_INTERNAL_ROOT}/gcc-linux-x86-64-cross)
	elseif (${PLATFORM} MATCHES "linux-x86-32")
		set(OPENSSL_PLATFORM_DIR ${OPENSSL_INTERNAL_ROOT}/gcc-linux-x86-32-cross)
	elseif (${PLATFORM} MATCHES "linux-arm-hwfpu")
		set(OPENSSL_PLATFORM_DIR ${OPENSSL_INTERNAL_ROOT}/gcc-linux-arm-hwfpu-cross)
        elseif (${PLATFORM} MATCHES "aarch64")
                set(OPENSSL_PLATFORM_DIR ${OPENSSL_INTERNAL_ROOT}/gcc-linux-arm-aarch64-cross)
	elseif (${PLATFORM} MATCHES "linux-arm")
		set(OPENSSL_PLATFORM_DIR ${OPENSSL_INTERNAL_ROOT}/gcc-linux-arm-cross)
	elseif (${PLATFORM} MATCHES "win32")
		set(OPENSSL_PLATFORM_DIR ${OPENSSL_INTERNAL_ROOT}/win32)
	elseif (${PLATFORM} MATCHES "win64")
		set(OPENSSL_PLATFORM_DIR ${OPENSSL_INTERNAL_ROOT}/win64)
	elseif (${PLATFORM} MATCHES "macos32")
		set(OPENSSL_PLATFORM_DIR ${OPENSSL_INTERNAL_ROOT}/osx32)
	elseif (${PLATFORM} MATCHES "macos64")
		set(OPENSSL_PLATFORM_DIR ${OPENSSL_INTERNAL_ROOT}/osx64)
	else ()
		MESSAGE(STATUS "Dynamically locating OpenSSL")
		find_package(OpenSSL) # Last resort
	endif()

	# Has the caller specified an external include path?
	if ("$ENV{THINGWORX_CSDK_OPENSSL_INCLUDE_DIR}" STREQUAL "")
		if (NOT ${OPENSSL_PLATFORM_DIR} STREQUAL "")
			if (${PLATFORM} STREQUAL "win64")
				# Win64 will use the same includes as the 32-bit Windows build
				set(OPENSSL_INCLUDE_DIR "${OPENSSL_INTERNAL_ROOT}/win32/include")
			else ()
				# Everything else should use a platform-dependent include directory
				set (OPENSSL_INCLUDE_DIR "${OPENSSL_PLATFORM_DIR}/include")
			endif ()
		endif ()
	else()
		set (OPENSSL_INCLUDE_DIR "$ENV{THINGWORX_CSDK_OPENSSL_INCLUDE_DIR}")
	endif()

	# Has the caller specified an external library path?
	if ("$ENV{THINGWORX_CSDK_OPENSSL_LIB_DIR}" STREQUAL "")
		if (NOT ${OPENSSL_PLATFORM_DIR} STREQUAL "")
			set (OPENSSL_LIB_DIR ${OPENSSL_PLATFORM_DIR}/lib)
		endif()
	else()
		set(OPENSSL_LIB_DIR "$ENV{THINGWORX_CSDK_OPENSSL_LIB_DIR}")
	endif()

	# Here the platform-dependent name of the SSL and encryption libraries are specified
	if (${PLATFORM} STREQUAL "win32" OR ${PLATFORM} STREQUAL "win64")
		set(OPENSSL_LIBRARIES
				${OPENSSL_LIB_DIR}/ssleay32.lib
				${OPENSSL_LIB_DIR}/libeay32.lib)
	elseif(${PLATFORM} MATCHES "macos.*")
		set(OPENSSL_LIBRARIES
			${OPENSSL_LIB_DIR}/libssl.1.0.0.dylib
			${OPENSSL_LIB_DIR}/libcrypto.1.0.0.dylib
		)
	else()
		set(OPENSSL_LIBRARIES
				${OPENSSL_LIB_DIR}/libssl.so.1.0.0
				${OPENSSL_LIB_DIR}/libcrypto.so.1.0.0)
	endif()

	# Has the caller specified an external OpenSSL binary (Windows only) path?
	if("$ENV{THINGWORX_CSDK_OPENSSL_BIN_DIR}" STREQUAL "")
		if(${PLATFORM} STREQUAL "win32" OR ${PLATFORM} STREQUAL "win64")
			set(OPENSSL_BIN_DIR ${OPENSSL_PLATFORM_DIR}/bin)
		endif()
	else()
		set(OPENSSL_BIN_DIR "$ENV{THINGWORX_CSDK_OPENSSL_BIN_DIR}")
	endif()

	# Here the platform-dependent name of the SSL and encryption binaries are specified
	if(${PLATFORM} STREQUAL "win32" OR ${PLATFORM} STREQUAL "win64")
		set(OPENSSL_SSLEAY_BIN_PATH ${OPENSSL_BIN_DIR}/ssleay32.dll)
		set(OPENSSL_LIBEAY_BIN_PATH ${OPENSSL_BIN_DIR}/libeay32.dll)
	endif()

	message(STATUS "#### OpenSSL Variables ####")
	message(STATUS "OPENSSL_INCLUDE_DIR: " ${OPENSSL_INCLUDE_DIR})
	message(STATUS "OPENSSL_LIBRARIES: " ${OPENSSL_LIBRARIES})

	if(NOT ${OPENSSL_SSLEAY_BIN_PATH} STREQUAL "")
		message (STATUS "OPENSSL_SSLEAY_BIN_PATH: " ${OPENSSL_SSLEAY_BIN_PATH})
	endif()

	if(NOT ${OPENSSL_LIBEAY_BIN_PATH} STREQUAL "")
		message (STATUS "OPENSSL_LIBEAY_BIN_PATH: " ${OPENSSL_LIBEAY_BIN_PATH})
	endif()
endif ()

#
# Compiler and linker configuration
#
message(STATUS "Configuring compiler and linker options")
# Enable features
if (ENABLE_TUNNELING)
	add_definitions(-DENABLE_TUNNELING)
endif()
if (ENABLE_FILE_XFER)
	add_definitions(-DENABLE_FILE_XFER)
endif()
if (ENABLE_OFFLINE_MSG_STORE_RAM)
	add_definitions(-DOFFLINE_MSG_STORE=1)
elseif (ENABLE_OFFLINE_MSG_STORE_FILE)
	add_definitions(-DOFFLINE_MSG_STORE=2)
endif()

if(IGNORE_UNSTABLE_TESTS)
	add_definitions(-DIGNORE_UNSTABLE_TESTS=1)
else(1)
	add_definitions(-DIGNORE_UNSTABLE_TESTS=0)
endif()

# When building a release, don't include stubs
set(CMAKE_C_FLAGS_DEBUG "-DTW_STUBS ${CMAKE_C_FLAGS_DEBUG}")
set(CMAKE_CXX_FLAGS_DEBUG "-DTW_STUBS ${CMAKE_CXX_FLAGS_DEBUG}")

# Set platform-specific definitions
if (${OS} MATCHES "macos")
	link_libraries(resolv)
	add_definitions(
		-DLTC_NO_ROLC
		-D_GNU_SOURCE
		-D_FILE_OFFSET_BITS=64
		-DCC_GNU
		-DPATH_MAX=255
		-pthread
		-fPIC
		-ffunction-sections
		-fdata-sections
		-Darch=${ARCHITECTURE}
	)
	set(CMAKE_MACOSX_RPATH 1)
elseif (${OS} MATCHES "linux")
	link_libraries(dl)
	link_libraries(m)
	link_libraries(pthread)
	link_libraries(resolv)
	if (${PLATFORM} MATCHES "linux-arm-hfwpu")
		# set linker flags
		set(
			CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -pthread -fPIC -Wl,--gc-sections"
			CACHE INTERNAL "" FORCE
		)
		# set defines and compiler flags
		add_definitions(
			-DLTC_NO_ROLC
			-mstructure-size-boundary=32
			-D_GNU_SOURCE
			-D_FILE_OFFSET_BITS=64
			-DCC_GNU
			-pthread
			-fPIC
			-ffunction-sections
			-fdata-sections
			-mfloat-abi=hard
			-mfpu=vfp
			-ffast-math
		)
        elseif (${PLATFORM} MATCHES "aarch64")
                # set linker flags
                set(
                        CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -pthread -fPIC -Wl,--gc-sections"
                        CACHE INTERNAL "" FORCE
                )
                # set defines and compiler flags
                add_definitions(
                        -DLTC_NO_ROLC
                        -D_GNU_SOURCE
                        -D_FILE_OFFSET_BITS=64
                        -DCC_GNU
                        -pthread
                        -fPIC
                        -ffunction-sections
                        -fdata-sections
                )
	elseif (${PLATFORM} MATCHES "linux-arm")
		# set linker flags
		set(
			CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -pthread -fPIC -Wl,--gc-sections"
			CACHE INTERNAL "" FORCE
		)
		# set defines and compiler flags
		add_definitions(
			-DLTC_NO_ROLC
			-mstructure-size-boundary=32
			-D_GNU_SOURCE
			-D_FILE_OFFSET_BITS=64
			-DCC_GNU
			-pthread
			-fPIC
			-ffunction-sections
			-fdata-sections
		)
	elseif (${PLATFORM} MATCHES "linux-coldfire")
		# set linker flags
		set(
			CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -fPIC -Wl,--gc-sections -march=isac -msoft-float -mcpu=54455"
			CACHE INTERNAL "" FORCE
		)
		# set defines and compiler flags
		add_definitions(
			-DLTC_NO_ROLC
			-mcpu=54455
			-march=isac
			-msoft-float
			-D_GNU_SOURCE
			-D_FILE_OFFSET_BITS=64
			-D_LINUX
			-DCPU_COLDFIRE
			-DCC_GNU
			-DBIG_ENDIAN_CPU
			-DARCH_IS_BIG_ENDIAN=1
			-DTW_HINTS=AF_INET
			-pthread
			-fPIC
			-ffunction-sections
			-fdata-sections
			-fmessage-length=0
			-fcommon
			-fdata-sections
		)
	elseif (${PLATFORM} MATCHES "linux-x86-32")
		add_definitions(
			-DTW_TLS_INCLUDE="twAxTls.h"
			#-DTW_TLS_INCLUDE="twNoTls.h" -DNO_TLS ### uncomment for no tls
			-DLTC_NO_ROLC
			-D_GNU_SOURCE
			-D_FILE_OFFSET_BITS=64
			-DCC_GNU
			-m32
			-pthread
			-fPIC
			-ffunction-sections
			-fdata-sections
			-DPATH_MAX=255
		)
	elseif (${PLATFORM} MATCHES "linux-x86-64")
		add_definitions(
			-DLTC_NO_ROLC
			-D_GNU_SOURCE
			-D_FILE_OFFSET_BITS=64
			-DCC_GNU
			-pthread
			-fPIC
			-ffunction-sections
			-fdata-sections
			-DPATH_MAX=255
		)
	endif ()
elseif (${OS} MATCHES "win")
	set(CMAKE_WINDOWS_EXPORT_ALL_SYMBOLS TRUE)
	if (ENABLE_FIPS_MODE)
		add_definitions(-DENABLE_FIPS_MODE=1)
	endif()
endif ()

add_subdirectory(src)
add_subdirectory(examples/SteamSensor)
add_subdirectory(examples/warehouseextlib)
add_subdirectory(examples/simpleextlib)
add_subdirectory(examples/ExtUseExample)
add_subdirectory(test)
if (NOT RELEASE)
	add_subdirectory(examples/Regression)
endif ()

# does the application run
add_test(SteamSensorRuns SteamSensor 25)
