Name:           pf9-ui-plugin
Version:        __VERSION__
Release:        __BUILDNUM__.__GITHASH__
Summary:        Platform9 UI Plugin

License:        Commercial
URL:            http://www.platform9.com

AutoReqProv:    no

Provides:       pf9-ui-plugin
Requires:       nginx
Requires:       openssl

BuildArch:      noarch
Group:          pf9-ui-plugin

%description
Platform9 UI Plugin

%prep

%build

%install
SRC_DIR=%_src_dir # build
DEST_DIR=${RPM_BUILD_ROOT}/opt/pf9/www/public/ui
mkdir -p $DEST_DIR
cp -r $SRC_DIR/* $DEST_DIR

%clean
rm -rf ${RPM_BUILD_ROOT}

%files
%defattr(-,root,root,-)
/opt/pf9

%post

%preun

%postun

%changelog
