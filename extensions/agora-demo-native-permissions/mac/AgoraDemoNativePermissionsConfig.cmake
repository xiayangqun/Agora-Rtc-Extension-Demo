set(AGORA_DEMO_NATIVE_PERMISSIONS_ROOT ${CMAKE_CURRENT_LIST_DIR}/..)

add_library(AgoraDemoNativePermissions STATIC
    ${AGORA_DEMO_NATIVE_PERMISSIONS_ROOT}/native/apple/AgoraDemoPermissionHelper.mm
)

set_target_properties(AgoraDemoNativePermissions PROPERTIES
    LINKER_LANGUAGE OBJCXX
)

target_link_options(AgoraDemoNativePermissions PUBLIC
    -ObjC
)

target_link_libraries(AgoraDemoNativePermissions PUBLIC
    "-framework AVFoundation"
    "-framework CoreGraphics"
)
